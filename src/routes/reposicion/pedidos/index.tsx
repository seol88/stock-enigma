import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../../../db';
import { replenishmentOrders } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export const useOrdersLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  return await db.select()
    .from(replenishmentOrders)
    .orderBy(desc(replenishmentOrders.createdAt))
    .all();
});

export default component$(() => {
  const ordersLoader = useOrdersLoader();

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-gray-800">Historial de Remitos</h2>
          <p class="text-xs text-gray-500">Historial completo de órdenes de compra y solicitudes de reposición.</p>
        </div>
        <Link href="/reposicion/" class="btn btn-ghost btn-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a Reposición
        </Link>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          {ordersLoader.value.length === 0 ? (
            <div class="p-12 text-center text-gray-500 font-medium">
              No se han generado remitos aún.
            </div>
          ) : (
            <table class="table w-full bg-transparent">
              <thead class="bg-gray-100/50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th class="py-4 pl-6 bg-transparent">Número de Remito</th>
                  <th class="py-4 bg-transparent">Fecha de Emisión</th>
                  <th class="py-4 text-center bg-transparent">Estado</th>
                  <th class="py-4 pr-6 text-center bg-transparent">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                {ordersLoader.value.map((order) => (
                  <tr key={order.id} class="border-b border-gray-100 bg-transparent hover:bg-gray-50/50">
                    <td class="pl-6 font-bold text-gray-900 bg-transparent">{order.number}</td>
                    <td class="bg-transparent text-gray-500">
                      {new Date(order.createdAt).toLocaleString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td class="text-center bg-transparent">
                      <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        order.status === 'en_curso' ? 'text-[#6B21A8] border-purple-200 bg-purple-50/20' :
                        order.status === 'recibido' ? 'text-green-700 border-green-200 bg-green-50/20' :
                        'text-gray-500 border-gray-200 bg-gray-50/20'
                      }`}>
                        {order.status === 'en_curso' ? 'Pedido en curso' : 
                         order.status === 'recibido' ? 'Completado' : 'Cancelado'}
                      </span>
                    </td>
                    <td class="pr-6 bg-transparent text-center">
                      <Link 
                        href={`/reposicion/pedidos/${order.id}`}
                        class="btn btn-ghost btn-xs text-[#6B21A8] hover:bg-[#6B21A8]/10 rounded-lg px-3 font-bold"
                      >
                        Ver Detalles / Imprimir
                      </Link>
                    </td>
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
  title: 'Historial de Remitos - Librería Enigma',
  meta: [{ name: 'description', content: 'Historial de remitos de reposición' }],
};
