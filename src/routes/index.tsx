import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../db';
import { products, replenishmentOrders, replenishmentLogs } from '../db/schema';
import { isNull, desc } from 'drizzle-orm';

export const useDashboardLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  
  try {
    const productsList = await db.select()
      .from(products)
      .where(isNull(products.deletedAt))
      .all();

    const totalProducts = productsList.length;
    const totalStock = productsList.reduce((acc, p) => acc + p.currentStock, 0);
    const totalValuation = productsList.reduce((acc, p) => acc + (p.price * p.currentStock), 0);

    // Stock health distribution counts
    const healthyCount = productsList.filter(p => p.currentStock > p.minStock).length;
    const lowStockCount = productsList.filter(p => p.currentStock <= p.minStock && p.currentStock > 0).length;
    const outOfStockCount = productsList.filter(p => p.currentStock === 0).length;

    // Top 5 urgent alerts
    const criticalAlerts = productsList
      .filter(p => p.currentStock <= p.minStock)
      .map(p => ({
        ...p,
        ratio: p.minStock > 0 ? p.currentStock / p.minStock : 1
      }))
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 5);

    // Fetch latest 5 replenishment orders & 5 receipt logs to merge into activity timeline
    const recentOrders = await db.select()
      .from(replenishmentOrders)
      .orderBy(desc(replenishmentOrders.createdAt))
      .limit(5)
      .all();

    const recentLogs = await db.select()
      .from(replenishmentLogs)
      .orderBy(desc(replenishmentLogs.receivedAt))
      .limit(5)
      .all();

    const events: any[] = [];
    
    recentOrders.forEach(o => {
      events.push({
        id: `order-${o.id}`,
        type: 'order',
        time: o.createdAt,
        text: `Remito ${o.number} generado`,
        status: o.status
      });
    });

    recentLogs.forEach(l => {
      events.push({
        id: `log-${l.id}`,
        type: 'received',
        time: l.receivedAt,
        text: `Recibidas ${l.quantityAdded} u. de ${l.productName}`,
        status: 'recibido'
      });
    });

    const activityFeed = events
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return {
      totalProducts,
      totalStock,
      totalValuation,
      healthyCount,
      lowStockCount,
      outOfStockCount,
      criticalAlerts,
      activityFeed
    };
  } catch (e) {
    console.error("Dashboard loader error:", e);
    return {
      totalProducts: 0,
      totalStock: 0,
      totalValuation: 0,
      healthyCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      criticalAlerts: [],
      activityFeed: []
    };
  }
});

export default component$(() => {
  const metrics = useDashboardLoader();

  // Donut chart calculations
  const total = metrics.value.totalProducts || 1;
  const healthyPct = Math.round((metrics.value.healthyCount / total) * 100);
  const lowPct = Math.round((metrics.value.lowStockCount / total) * 100);
  const outPct = Math.round((metrics.value.outOfStockCount / total) * 100);

  // SVG dash offsets for stacked circle segments
  const offsetHealthy = 0;
  const offsetLow = 100 - healthyPct;
  const offsetOut = 100 - healthyPct - lowPct;

  return (
    <div class="space-y-8 p-4 md:p-6">
      
      {/* Saludo */}
      <div>
        <h2 class="text-2xl font-black text-gray-800 tracking-tight">¡Hola de nuevo!</h2>
        <p class="text-sm text-gray-500 mt-1">Este es el estado del inventario de Librería Enigma para el día de hoy.</p>
      </div>

      {/* Tarjetas KPI en Colores Pasteles */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Artículos */}
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div class="space-y-2">
            <span class="text-xs font-bold text-indigo-500 uppercase tracking-wider">Total de Artículos</span>
            <h3 class="text-3xl font-black text-indigo-950">{metrics.value.totalProducts}</h3>
            <p class="text-xs text-indigo-700/80 font-medium">Equivalente a {metrics.value.totalStock} unidades en almacén.</p>
          </div>
          <div class="p-3 bg-white border border-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
        </div>

        {/* Bajo Stock / Crítico */}
        <div class="bg-red-50/50 border border-red-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div class="space-y-2">
            <span class="text-xs font-bold text-red-500 uppercase tracking-wider">Artículos con Bajo Stock</span>
            <h3 class="text-3xl font-black text-red-950">{metrics.value.lowStockCount + metrics.value.outOfStockCount}</h3>
            <p class="text-xs text-red-700/80 font-medium">Artículos que necesitan reponerse de inmediato.</p>
          </div>
          <div class="p-3 bg-white border border-red-100 rounded-2xl text-red-600 shadow-sm animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>

        {/* Valorización Inventario */}
        <div class="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex items-center justify-between shadow-sm sm:col-span-2 lg:col-span-1">
          <div class="space-y-2">
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Valorización de Stock</span>
            <h3 class="text-3xl font-black text-emerald-950">
              {metrics.value.totalValuation.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
            </h3>
            <p class="text-xs text-emerald-700/80 font-medium">Costo total de mercadería activa en inventario.</p>
          </div>
          <div class="p-3 bg-white border border-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 20h4a2 2 0 002-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>

      </div>

      {/* Gráfico y Bitácora */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Salud del Inventario */}
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-1 flex flex-col justify-between space-y-6">
          <div>
            <h3 class="font-black text-gray-800 text-base">Salud de Inventario</h3>
            <p class="text-xs text-gray-400 mt-0.5">Distribución porcentual de los niveles de stock.</p>
          </div>
          
          <div class="relative flex justify-center items-center my-2">
            {/* SVG Donut Chart */}
            <svg viewBox="0 0 42 42" class="w-44 h-44 transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F3F4F6" stroke-width="5"></circle>
              
              {/* Segmento Saludable (Verde Pastel) */}
              {healthyPct > 0 && (
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#A7F3D0" stroke-width="5"
                  stroke-dasharray={`${healthyPct} ${100 - healthyPct}`} stroke-dashoffset={offsetHealthy}></circle>
              )}
              
              {/* Segmento Bajo Stock (Amarillo Pastel) */}
              {lowPct > 0 && (
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#FDE68A" stroke-width="5"
                  stroke-dasharray={`${lowPct} ${100 - lowPct}`} stroke-dashoffset={offsetLow}></circle>
              )}

              {/* Segmento Sin Stock (Rojo Pastel) */}
              {outPct > 0 && (
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#FCA5A5" stroke-width="5"
                  stroke-dasharray={`${outPct} ${100 - outPct}`} stroke-dashoffset={offsetOut}></circle>
              )}
            </svg>
            
            {/* Centro del Donut */}
            <div class="absolute text-center space-y-0.5">
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
              <p class="text-2xl font-black text-gray-800">{metrics.value.totalProducts}</p>
              <span class="text-[10px] text-gray-500 font-semibold">Artículos</span>
            </div>
          </div>

          {/* Leyendas con Colores Pasteles */}
          <div class="space-y-2 pt-2 border-t border-gray-100">
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#A7F3D0]"></span>
                <span class="text-gray-600 font-medium">Disponible</span>
              </div>
              <span class="font-extrabold text-gray-800">{metrics.value.healthyCount} u. ({healthyPct}%)</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#FDE68A]"></span>
                <span class="text-gray-600 font-medium">Bajo Stock</span>
              </div>
              <span class="font-extrabold text-gray-800">{metrics.value.lowStockCount} u. ({lowPct}%)</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#FCA5A5]"></span>
                <span class="text-gray-600 font-medium">Agotado</span>
              </div>
              <span class="font-extrabold text-gray-800">{metrics.value.outOfStockCount} u. ({outPct}%)</span>
            </div>
          </div>
        </div>

        {/* Bitácora de Actividad Reciente */}
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-6">
          <div>
            <h3 class="font-black text-gray-800 text-base">Bitácora de Actividad Reciente</h3>
            <p class="text-xs text-gray-400 mt-0.5">Historial cronológico de compras y abastecimiento de productos.</p>
          </div>

          <div class="flex-1 space-y-4">
            {metrics.value.activityFeed.length === 0 ? (
              <div class="h-full flex flex-col items-center justify-center py-12 text-center space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p class="text-xs text-gray-400 font-medium">No se registran actividades recientes en el sistema.</p>
              </div>
            ) : (
              <div class="relative border-l border-gray-100 pl-4 ml-2 space-y-5 py-1">
                {metrics.value.activityFeed.map((evt) => (
                  <div key={evt.id} class="relative text-xs">
                    {/* Indicador de la línea de tiempo */}
                    <span class={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                      evt.type === 'order' 
                        ? 'bg-purple-400' 
                        : 'bg-emerald-400'
                    }`}></span>
                    <div class="flex justify-between items-start gap-4">
                      <div>
                        <p class="font-bold text-gray-800">{evt.text}</p>
                        <span class="text-[10px] text-gray-400">
                          {new Date(evt.time).toLocaleDateString('es-AR', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span class={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        evt.status === 'recibido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        evt.status === 'en_curso' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {evt.status === 'en_curso' ? 'En curso' : 
                         evt.status === 'recibido' ? 'Recibido' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div class="pt-4 border-t border-gray-100 text-center">
            <Link href="/reposicion/pedidos/" class="text-xs text-[#6B21A8] font-bold hover:underline">
              Ver todos los remitos emitidos →
            </Link>
          </div>
        </div>

      </div>

      {/* Widget de Alertas Críticas (Top 5 Productos más urgentes) */}
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black text-gray-800 text-base">Alertas de Reposición Urgentes</h3>
            <p class="text-xs text-gray-400 mt-0.5">Los 5 productos que están más cerca de agotarse o tienen menor porcentaje de stock mínimo.</p>
          </div>
          <Link 
            href="/reposicion/" 
            class="btn btn-sm bg-[#6B21A8]/10 hover:bg-[#6B21A8]/20 text-[#6B21A8] border-none rounded-xl text-xs font-bold"
          >
            Ir al Panel de Reposición →
          </Link>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-sm w-full border-none">
            <thead>
              <tr class="text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
                <th class="py-3">Código</th>
                <th class="py-3">Producto</th>
                <th class="py-3">Categoría</th>
                <th class="py-3 text-center">Stock Mínimo</th>
                <th class="py-3 text-center">Stock Actual</th>
                <th class="py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {metrics.value.criticalAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} class="text-center py-8 text-gray-400 text-xs font-medium">
                    🎉 ¡Felicidades! Todos los productos tienen stock suficiente.
                  </td>
                </tr>
              ) : (
                metrics.value.criticalAlerts.map((prod) => (
                  <tr key={prod.id} class="hover:bg-gray-50/50 border-b border-gray-100/60 transition-colors">
                    <td class="font-mono text-xs text-gray-500 font-semibold py-3">{prod.code}</td>
                    <td class="font-bold text-gray-700 py-3">{prod.name}</td>
                    <td class="py-3">
                      <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase">
                        {prod.category || 'Sin categoría'}
                      </span>
                    </td>
                    <td class="text-center font-medium text-gray-500 py-3">{prod.minStock} u.</td>
                    <td class="text-center py-3">
                      <span class={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        prod.currentStock === 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {prod.currentStock} u.
                      </span>
                    </td>
                    <td class="text-right py-3">
                      <Link 
                        href="/reposicion/"
                        class="btn btn-xs bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-lg px-3 py-1 font-bold text-[10px]"
                      >
                        Pedir Stock
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Librería Enigma',
  meta: [
    {
      name: 'description',
      content: 'Resumen de stock, inventario y alertas del negocio',
    },
  ],
};
