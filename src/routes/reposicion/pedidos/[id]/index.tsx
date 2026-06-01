import { component$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../db';
import { replenishmentOrders, replenishmentOrderItems } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const useOrderDetailLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const { id } = event.params;

  const order = await db.select().from(replenishmentOrders).where(eq(replenishmentOrders.id, id)).get();
  if (!order) {
    throw event.redirect(303, '/reposicion/pedidos/');
  }

  const items = await db.select()
    .from(replenishmentOrderItems)
    .where(eq(replenishmentOrderItems.orderId, id))
    .all();

  return { order, items };
});

export default component$(() => {
  const detailLoader = useOrderDetailLoader();
  const order = detailLoader.value.order;
  const items = detailLoader.value.items;

  const handlePrint = $(() => {
    window.print();
  });

  return (
    <div class="max-w-3xl mx-auto space-y-6">
      
      {/* Estilos CSS de impresión A4 profesionales */}
      <style>{`
        @media print {
          /* Ocultar barra lateral, cabecera y controles de pantalla */
          header, sidebar, nav, .btn, .no-print, .breadcrumbs {
            display: none !important;
          }
          /* Quitar márgenes/bordes del contenedor principal */
          body, main, #print-remito-document {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #print-remito-document {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 20mm 15mm !important;
          }
        }
        @page {
          size: auto;
          margin: 0mm;
        }
      `}</style>

      {/* Migas de pan y controles (no se imprimen) */}
      <div class="flex items-center justify-between no-print">
        <div class="text-xs breadcrumbs text-gray-500">
          <ul>
            <li><Link href="/reposicion/">Reposición</Link></li>
            <li><Link href="/reposicion/pedidos/">Remitos</Link></li>
            <li class="font-bold text-gray-700">{order.number}</li>
          </ul>
        </div>
        <div class="flex gap-2">
          <Link href="/reposicion/pedidos/" class="btn btn-ghost btn-sm text-gray-500">
            Volver
          </Link>
          <button 
            onClick$={handlePrint}
            class="btn btn-sm bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-5 py-2 shadow-md shadow-[#6B21A8]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir Remito
          </button>
        </div>
      </div>

      {/* Documento Físico (Remito A4) */}
      <div id="print-remito-document" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8 text-black">
        
        {/* Encabezado Profesional */}
        <div class="flex justify-between items-start border-b border-gray-200 pb-6">
          <div>
            <h1 class="text-3xl font-black uppercase tracking-wider text-[#6B21A8] print:text-black">Librería Enigma</h1>
            <p class="text-xs text-gray-500 font-bold uppercase mt-1">Regalería • Librería • Juguetería</p>
            <p class="text-xs text-gray-400 mt-0.5">Av. de Prueba 1234, Buenos Aires</p>
          </div>
          <div class="text-right space-y-1">
            <span class="inline-block px-3 py-1 bg-purple-50 text-[#6B21A8] border border-purple-200 text-xs font-bold rounded-full uppercase print:hidden">
              {order.status === 'en_curso' ? 'Pedido en curso' : 
               order.status === 'recibido' ? 'Recibido' : 'Cancelado'}
            </span>
            <h2 class="text-xl font-bold uppercase text-gray-800 tracking-wide mt-1">Remito de Compra</h2>
            <p class="text-sm font-mono text-gray-600">{order.number}</p>
            <p class="text-xs text-gray-400">
              Emitido: {new Date(order.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Detalles / Renglones */}
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Mercadería Solicitada:</h3>
          <table class="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-600">
                <th class="border border-gray-200 p-3 text-left w-32">SKU Código</th>
                <th class="border border-gray-200 p-3 text-left">Producto</th>
                <th class="border border-gray-200 p-3 text-center w-36">Cant. Solicitada</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} class="hover:bg-gray-50/30">
                  <td class="border border-gray-200 p-3 font-mono text-gray-600">{item.productId}</td>
                  <td class="border border-gray-200 p-3 font-bold text-gray-800">{item.productName}</td>
                  <td class="border border-gray-200 p-3 text-center font-extrabold text-gray-900">{item.quantity} u.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Firmas en la parte inferior */}
        <div class="pt-24 grid grid-cols-2 gap-12 text-xs text-gray-500">
          <div class="flex flex-col items-center">
            <div class="border-t border-gray-300 pt-2 w-48 text-center uppercase tracking-wide">Firma Autorizada</div>
            <p class="text-[10px] text-gray-400 mt-1">Librería Enigma</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="border-t border-gray-300 pt-2 w-48 text-center uppercase tracking-wide">Firma Conforme</div>
            <p class="text-[10px] text-gray-400 mt-1">Recibido por / Proveedor</p>
          </div>
        </div>

      </div>

    </div>
  );
});

export const head: DocumentHead = {
  title: 'Detalle de Remito - Librería Enigma',
  meta: [{ name: 'description', content: 'Visor y descarga del remito de compra' }],
};
