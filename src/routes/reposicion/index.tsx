import { component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { getDb } from '../../db';
import { products, replenishmentLogs } from '../../db/schema';
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

// Acción para actualizar el estado de reposición
export const useUpdateStatusAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const { productId, status } = data;

  await db.update(products)
    .set({ replenishmentStatus: status })
    .where(eq(products.id, productId))
    .run();

  return { success: true };
}, zod$({
  productId: z.string(),
  status: z.enum(['none', 'para_pedir', 'pedido_en_curso', 'esperando_recepcion']),
}));

// Acción para recibir stock de reposición
export const useReceiveReplenishmentAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const { productId, quantity } = data;

  // 1. Obtener producto
  const product = await db.select().from(products).where(eq(products.id, productId)).get();
  if (!product) {
    return { success: false, error: 'Producto no encontrado.' };
  }

  // 2. Incrementar stock y reiniciar estado a "none"
  const newStock = product.currentStock + quantity;
  await db.update(products)
    .set({
      currentStock: newStock,
      replenishmentStatus: 'none',
    })
    .where(eq(products.id, productId))
    .run();

  // 3. Registrar log de recepción
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

export default component$(() => {
  const dataLoader = useReplenishmentLoader();
  const updateStatusAction = useUpdateStatusAction();
  const receiveAction = useReceiveReplenishmentAction();

  // ID del producto seleccionado para recibir stock
  const activeProductId = useSignal<string | null>(null);
  const activeProductName = useSignal<string>('');
  const receiveQuantity = useSignal<string>('');

  const criticalProducts = dataLoader.value.criticalProducts;
  const logs = dataLoader.value.logs;

  // Calcular KPIs en base a productos críticos cargados
  const totalCritical = criticalProducts.length;
  const countToOrder = criticalProducts.filter(p => p.replenishmentStatus === 'para_pedir').length;
  const countOrdered = criticalProducts.filter(p => p.replenishmentStatus === 'pedido_en_curso').length;

  return (
    <div class="space-y-6">
      
      {/* KPIs de Reposición */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
          <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 class="text-3xl font-extrabold mb-1 relative z-10">{totalCritical}</h3>
          <p class="text-white/80 text-sm font-medium relative z-10">Artículos Críticos / Bajo Stock</p>
        </div>

        <div class="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#6B21A8]/30 transition-colors">
          <h3 class="text-3xl font-extrabold text-amber-600 mb-1">{countToOrder}</h3>
          <p class="text-gray-600 text-sm font-medium">En Lista de Compra ("Para pedir")</p>
        </div>

        <div class="bg-[#E9D5FF] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <h3 class="text-3xl font-extrabold text-[#6B21A8] mb-1">{countOrdered}</h3>
          <p class="text-[#6B21A8]/80 text-sm font-medium">Pedidos en Curso / Enviados</p>
        </div>
      </div>

      {/* Formulario de Entrada Rápida de Recepción (Si se activa el modal) */}
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
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">Flujo de Reposición</h3>
          <span class="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 uppercase tracking-wide">Requiere Atención</span>
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
                  <th class="py-4 pl-6 bg-transparent">Código</th>
                  <th class="py-4 bg-transparent">Producto</th>
                  <th class="py-4 text-center bg-transparent">Stock / Mínimo</th>
                  <th class="py-4 text-center bg-transparent">Estado de Reposición</th>
                  <th class="py-4 pr-6 text-center bg-transparent">Acciones de Compra</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                {criticalProducts.map((p) => (
                  <tr key={p.code} class="border-b border-gray-100 bg-transparent">
                    <td class="pl-6 font-medium text-gray-900 bg-transparent">{p.code}</td>
                    <td class="bg-transparent font-bold text-gray-800">{p.name}</td>
                    <td class="text-center bg-transparent">
                      <span class="font-bold text-red-600">{p.currentStock}</span> 
                      <span class="text-gray-400"> / {p.minStock}</span>
                    </td>
                    <td class="text-center bg-transparent">
                      <select 
                        class={`select select-sm max-w-xs bg-white border border-gray-200 rounded-lg text-gray-800 font-medium focus:border-[#6B21A8] ${
                          p.replenishmentStatus === 'para_pedir' ? 'text-amber-700 border-amber-300 bg-amber-50/20' :
                          p.replenishmentStatus === 'pedido_en_curso' ? 'text-[#6B21A8] border-purple-300 bg-purple-50/20' :
                          'text-gray-600'
                        }`}
                        value={p.replenishmentStatus}
                        onChange$={async (e) => {
                          const val = (e.target as HTMLSelectElement).value;
                          await updateStatusAction.submit({ productId: p.id, status: val as any });
                        }}
                      >
                        <option value="none">Ninguno (Inactivo)</option>
                        <option value="para_pedir">Para pedir (Lista de compra)</option>
                        <option value="pedido_en_curso">Pedido en curso</option>
                      </select>
                    </td>
                    <td class="pr-6 bg-transparent text-center">
                      {p.replenishmentStatus === 'pedido_en_curso' ? (
                        <button 
                          class="btn btn-xs bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-lg px-4"
                          onClick$={() => {
                            activeProductId.value = p.id;
                            activeProductName.value = p.name;
                          }}
                        >
                          Recibir Stock
                        </button>
                      ) : (
                        <span class="text-xs text-gray-400 font-medium">Asignar 'Pedido en curso' para recibir</span>
                      )}
                    </td>
                  </tr>
                ))}
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
  );
});

export const head: DocumentHead = {
  title: 'Panel de Reposición - Librería Enigma',
  meta: [{ name: 'description', content: 'Panel para reabastecimiento y flujo de compras en Turso' }],
};
