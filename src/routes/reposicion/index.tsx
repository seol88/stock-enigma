import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { getDb } from '../../db';
import { products, replenishmentLogs, replenishmentOrders, replenishmentOrderItems } from '../../db/schema';
import { eq, isNull, and, lte, desc } from 'drizzle-orm';

// Carga de productos críticos e historial de logs
export const useReplenishmentLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  
  // Cargar productos con stock bajo o agotado
  const criticalProducts = await db.select()
    .from(products)
    .where(
      and(
        isNull(products.deletedAt),
        lte(products.currentStock, products.minStock)
      )
    )
    .all();

  // Cargar los últimos 5 registros de recepción
  const logs = await db.select()
    .from(replenishmentLogs)
    .orderBy(desc(replenishmentLogs.receivedAt))
    .limit(5)
    .all();

  return { criticalProducts, logs };
});

// Acción para generar remito persistente en BD
export const useCreateOrderAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const { items } = data; // Array de { productId, quantity }

  const orderId = Math.random().toString(36).substring(2, 11);
  const timestamp = Date.now();
  const orderNumber = `REM-${timestamp.toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Crear Cabecera del Remito
  await db.insert(replenishmentOrders).values({
    id: orderId,
    number: orderNumber,
    createdAt: new Date(),
    status: 'en_curso',
  }).run();

  // 2. Crear Detalles y actualizar productos
  for (const item of items) {
    const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
    const productName = product ? product.name : 'Producto Desconocido';
    const itemId = Math.random().toString(36).substring(2, 11);

    await db.insert(replenishmentOrderItems).values({
      id: itemId,
      orderId,
      productId: item.productId,
      productName,
      quantity: item.quantity,
    }).run();

    await db.update(products)
      .set({
        replenishmentStatus: 'pedido_en_curso',
        requestedQuantity: item.quantity,
      })
      .where(eq(products.id, item.productId))
      .run();
  }

  // Redirigir al visor del remito recién creado
  throw event.redirect(303, `/reposicion/pedidos/${orderId}/`);
}, zod$({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })),
}));

// Acción para recibir stock de reposición
export const useReceiveReplenishmentAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const { productId, quantity } = data;

  const product = await db.select().from(products).where(eq(products.id, productId)).get();
  if (!product) {
    return { success: false, error: 'Producto no encontrado.' };
  }

  const newStock = product.currentStock + quantity;
  await db.update(products)
    .set({
      currentStock: newStock,
      replenishmentStatus: 'none',
      requestedQuantity: 0,
    })
    .where(eq(products.id, productId))
    .run();

  const logId = Math.random().toString(36).substring(2, 11);
  await db.insert(replenishmentLogs).values({
    id: logId,
    productId,
    productName: product.name,
    quantityAdded: quantity,
    receivedAt: new Date(),
  }).run();

  return { success: true };
}, zod$({
  productId: z.string(),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor que 0'),
}));

// Acción para cancelar un pedido en curso
export const useCancelOrderAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const { productId } = data;

  await db.update(products)
    .set({
      replenishmentStatus: 'none',
      requestedQuantity: 0,
    })
    .where(eq(products.id, productId))
    .run();

  return { success: true };
}, zod$({
  productId: z.string(),
}));

export default component$(() => {
  const dataLoader = useReplenishmentLoader();
  const createOrderAction = useCreateOrderAction();
  const receiveAction = useReceiveReplenishmentAction();
  const cancelOrderAction = useCancelOrderAction();

  // Estado del Carrito local (productos marcados para pedir)
  const orderCart = useStore<Record<string, { selected: boolean, quantity: number }>>({});

  // ID del producto seleccionado para recibir stock
  const activeProductId = useSignal<string | null>(null);
  const activeProductName = useSignal<string>('');
  const receiveQuantity = useSignal<string>('');

  const criticalProducts = dataLoader.value.criticalProducts;
  const logs = dataLoader.value.logs;

  // Inicializar carrito localmente si el producto no está registrado en el store
  criticalProducts.forEach((p) => {
    if (orderCart[p.id] === undefined) {
      const suggestedQty = Math.max(p.minStock - p.currentStock, 10);
      orderCart[p.id] = { selected: false, quantity: suggestedQty };
    }
  });

  // KPIs dinámicos
  const totalCritical = criticalProducts.length;
  const countSelected = Object.values(orderCart).filter(item => item.selected).length;
  const countOrdered = criticalProducts.filter(p => p.replenishmentStatus === 'pedido_en_curso').length;

  const handleGenerateRemito = $(async () => {
    const selectedItems = Object.entries(orderCart)
      .filter(([, val]) => val.selected)
      .map(([id, val]) => ({ productId: id, quantity: val.quantity }));

    if (selectedItems.length === 0) {
      alert('Por favor, selecciona al menos un producto de la lista para pedir.');
      return;
    }

    await createOrderAction.submit({ items: selectedItems });
  });

  return (
    <div class="space-y-6">
      
      {/* Contenido en Pantalla */}
      <div class="space-y-6">
        
        {/* KPIs de Reposición */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-[#FEF2F2] border border-red-200 rounded-2xl p-6 text-red-700 relative overflow-hidden group">
            <h3 class="text-3xl font-extrabold mb-1 relative z-10">{totalCritical}</h3>
            <p class="text-red-600/80 text-sm font-medium relative z-10">Artículos Críticos / Bajo Stock</p>
          </div>

          <div class="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#6B21A8]/30 transition-colors">
            <h3 class="text-3xl font-extrabold text-amber-600 mb-1">{countSelected}</h3>
            <p class="text-gray-600 text-sm font-medium">Marcados para Pedir</p>
          </div>

          <div class="bg-[#E9D5FF] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <h3 class="text-3xl font-extrabold text-[#6B21A8] mb-1">{countOrdered}</h3>
            <p class="text-[#6B21A8]/80 text-sm font-medium">Pedidos en Curso / Por Recibir</p>
          </div>
        </div>

        {/* Modal de Recepción */}
        {activeProductId.value && (
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
              <h3 class="text-lg font-bold text-gray-900">Registrar Recepción</h3>
              <p class="text-sm text-gray-500">
                ¿Cuántas unidades de <strong class="text-gray-800">{activeProductName.value}</strong> has recibido?
              </p>
              {receiveAction.value?.error && (
                <div class="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {receiveAction.value.error}
                </div>
              )}
              <div class="form-control">
                <input 
                  type="number" 
                  placeholder="Cantidad recibida..." 
                  class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900 h-11"
                  value={receiveQuantity.value}
                  onInput$={(e) => receiveQuantity.value = (e.target as HTMLInputElement).value}
                />
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button 
                  class="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-xl px-4"
                  onClick$={() => {
                    activeProductId.value = null;
                    receiveQuantity.value = '';
                  }}
                >
                  Cancelar
                </button>
                <button 
                  class="btn btn-sm bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-5"
                  onClick$={async () => {
                    const qty = parseInt(receiveQuantity.value);
                    if (qty > 0 && activeProductId.value) {
                      await receiveAction.submit({ productId: activeProductId.value, quantity: qty });
                      activeProductId.value = null;
                      receiveQuantity.value = '';
                    }
                  }}
                >
                  Guardar e Incrementar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Artículos Bajo Stock */}
        <div class="bg-[#FDFBF7] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Flujo de Reposición</h3>
              <p class="text-xs text-gray-500 mt-0.5">Selecciona los productos y define las cantidades para generar el remito.</p>
            </div>
            
            <div class="flex gap-2">
              <Link 
                href="/reposicion/pedidos/" 
                class="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4"
              >
                Historial de Remitos
              </Link>
              <button 
                class="btn btn-sm bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-5 py-2 shadow-md shadow-[#6B21A8]/20"
                onClick$={handleGenerateRemito}
                disabled={countSelected === 0 || createOrderAction.isRunning}
              >
                {createOrderAction.isRunning ? 'Generando...' : 'Generar Remito de Compra'}
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            {criticalProducts.length === 0 ? (
              <div class="p-12 text-center text-gray-500 font-medium">
                🎉 ¡No hay productos con stock crítico! Todo el inventario está por encima del mínimo.
              </div>
            ) : (
              <table class="table w-full bg-transparent">
                <thead class="bg-gray-100/50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th class="py-4 pl-6 bg-transparent w-12 text-center">Pedir</th>
                    <th class="py-4 bg-transparent">Código</th>
                    <th class="py-4 bg-transparent">Producto</th>
                    <th class="py-4 text-center bg-transparent">Stock / Mínimo</th>
                    <th class="py-4 text-center bg-transparent w-40">Cant. a Pedir</th>
                    <th class="py-4 text-center bg-transparent">Estado de Compra</th>
                    <th class="py-4 pr-6 text-center bg-transparent">Acciones</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  {criticalProducts.map((p) => {
                    const isOrdered = p.replenishmentStatus === 'pedido_en_curso';
                    return (
                      <tr key={p.code} class={`border-b border-gray-100 bg-transparent transition-colors ${orderCart[p.id]?.selected ? 'bg-[#6B21A8]/5 hover:bg-[#6B21A8]/5' : ''}`}>
                        <td class="pl-6 text-center bg-transparent">
                          {!isOrdered ? (
                            <input 
                              type="checkbox" 
                              class="checkbox checkbox-sm checkbox-primary rounded accent-[#6B21A8]"
                              checked={orderCart[p.id]?.selected || false}
                              onChange$={(e) => {
                                orderCart[p.id].selected = (e.target as HTMLInputElement).checked;
                              }}
                            />
                          ) : (
                            <span class="text-gray-300">-</span>
                          )}
                        </td>
                        <td class="font-medium text-gray-900 bg-transparent">{p.code}</td>
                        <td class="bg-transparent font-bold text-gray-800">{p.name}</td>
                        <td class="text-center bg-transparent">
                          <span class="font-bold text-red-600">{p.currentStock}</span> 
                          <span class="text-gray-400"> / {p.minStock}</span>
                        </td>
                        <td class="text-center bg-transparent">
                          {!isOrdered ? (
                            <input 
                              type="number" 
                              class="input input-xs bg-white border border-gray-200 focus:border-[#6B21A8] text-center w-20 rounded-md text-gray-900 font-bold"
                              value={orderCart[p.id]?.quantity || 10}
                              onInput$={(e) => {
                                const val = parseInt((e.target as HTMLInputElement).value) || 0;
                                orderCart[p.id].quantity = val;
                              }}
                              disabled={!orderCart[p.id]?.selected}
                            />
                          ) : (
                            <span class="font-bold text-gray-700">{p.requestedQuantity} u.</span>
                          )}
                        </td>
                        <td class="text-center bg-transparent">
                          <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-white ${
                            isOrdered ? 'text-[#6B21A8] border-purple-200 bg-purple-50/10' :
                            p.replenishmentStatus === 'para_pedir' ? 'text-amber-700 border-amber-200 bg-amber-50/10' :
                            'text-gray-500 border-gray-200'
                          }`}>
                            {isOrdered ? 'Pedido en curso' : 'Para pedir'}
                          </span>
                        </td>
                        <td class="pr-6 bg-transparent text-center">
                          {isOrdered ? (
                            <div class="flex items-center justify-center gap-2">
                              <button 
                                class="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none rounded-lg px-3"
                                onClick$={() => {
                                  activeProductId.value = p.id;
                                  activeProductName.value = p.name;
                                  receiveQuantity.value = p.requestedQuantity.toString();
                                }}
                              >
                                Recibir
                              </button>
                              <button 
                                class="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg px-2"
                                onClick$={async () => {
                                  if (confirm(`¿Deseas cancelar el pedido de ${p.name}?`)) {
                                    await cancelOrderAction.submit({ productId: p.id });
                                  }
                                }}
                                disabled={cancelOrderAction.isRunning}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span class="text-xs text-gray-400 font-medium">Marca el checkbox para pedir</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Historial de Recepción de Stock */}
        <div class="bg-[#FDFBF7] rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800">Historial de Recepciones (Últimas 5)</h3>
          <div class="overflow-x-auto">
            {logs.length === 0 ? (
              <div class="text-sm text-gray-500 font-medium py-4">No se han registrado recepciones aún.</div>
            ) : (
              <table class="table w-full bg-transparent">
                <thead class="text-xs text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th class="py-2 pl-0">Fecha y Hora</th>
                    <th class="py-2">Producto</th>
                    <th class="py-2 text-right">Cantidad Recibida</th>
                  </tr>
                </thead>
                <tbody class="text-sm text-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} class="border-b border-gray-50 bg-transparent">
                      <td class="py-3 pl-0 text-gray-500">
                        {new Date(log.receivedAt).toLocaleString('es-AR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td class="py-3 font-bold text-gray-800">{log.productName}</td>
                      <td class="py-3 text-right font-extrabold text-green-600">+{log.quantityAdded} u.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Panel de Reposición - Librería Enigma',
  meta: [{ name: 'description', content: 'Panel para reabastecimiento y flujo de compras en Turso' }],
};
