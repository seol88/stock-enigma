import { component$, $, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, Link, server$ } from '@builder.io/qwik-city';
import { authClient } from '../../../lib/auth-client';

// Server-side database fetching with dynamic imports to avoid bundler leakage
const getLowStockProducts = server$(async function() {
  const { getDb } = await import('../../../db');
  const { products } = await import('../../../db/schema');
  const { and, isNull, lte } = await import('drizzle-orm');

  const db = getDb(this.env);
  try {
    return await db.select()
      .from(products)
      .where(
        and(
          lte(products.currentStock, products.minStock),
          isNull(products.deletedAt)
        )
      )
      .all();
  } catch (e) {
    console.error("Error loading low stock in header server$:", e);
    return [];
  }
});

export const Header = component$(() => {
  const loc = useLocation();
  const lowStockItems = useSignal<any[]>([]);
  const alertCount = useSignal(0);
  
  useVisibleTask$(async () => {
    const items = await getLowStockProducts();
    lowStockItems.value = items;
    alertCount.value = items.length;
  });
  
  const getPageTitle = () => {
    const path = loc.url.pathname;
    if (path.startsWith('/productos')) return 'Gestión de Productos';
    if (path.startsWith('/reposicion')) return 'Panel de Reposición';
    if (path.startsWith('/configuracion')) return 'Configuración';
    return 'Dashboard General';
  };

  const handleLogout = $(async () => {
    await authClient.signOut();
    window.location.href = '/login';
  });

  return (
    <header class="bg-white border-b border-gray-200 sticky top-0 z-45 shadow-sm flex items-center h-16 px-4 justify-between gap-4">
      {/* Título en Desktop / Logo en Mobile */}
      <div class="flex items-center gap-3">
        {/* Logo solo en mobile */}
        <div class="md:hidden w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 bg-white">
          <img src="/logo.webp" alt="Logo" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-xl font-bold text-gray-800 hidden md:block whitespace-nowrap">{getPageTitle()}</h1>
      </div>

      {/* Buscador central en Mobile */}
      <div class="flex-1 max-w-md md:hidden relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          class="w-full pl-9 pr-3 py-2 bg-gray-100 border border-transparent rounded-full text-sm focus:ring-2 focus:ring-[#6B21A8] focus:bg-white focus:border-gray-200 outline-none transition-all"
        />
      </div>
      
      {/* Perfil y Notificaciones */}
      <div class="flex items-center gap-3">
        
        {/* Campanita de Notificaciones */}
        <div class="dropdown dropdown-end">
          <div 
            tabIndex={0} 
            role="button" 
            class="btn btn-ghost btn-circle text-gray-500 hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-all duration-200"
          >
            <div class="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {alertCount.value > 0 && (
                <span class="badge badge-xs bg-red-400 border-none indicator-item animate-pulse"></span>
              )}
            </div>
          </div>
          <div tabIndex={0} class="dropdown-content mt-3 z-[50] card card-compact w-80 p-2 shadow-xl bg-white border border-gray-100 rounded-2xl">
            <div class="card-body">
              <h3 class="font-bold text-sm text-gray-700 flex justify-between items-center border-b border-gray-100 pb-2">
                <span>Notificaciones de Stock</span>
                {alertCount.value > 0 && (
                  <span class="px-2 py-0.5 bg-[#FEF2F2] text-red-600 text-[10px] font-bold rounded-full">
                    {alertCount.value} alertas
                  </span>
                )}
              </h3>
              <div class="max-h-64 overflow-y-auto space-y-2 mt-1">
                {alertCount.value === 0 ? (
                  <div class="py-4 text-center text-xs text-gray-400">
                    🎉 ¡Todo al día! No hay stock crítico.
                  </div>
                ) : (
                  lowStockItems.value.slice(0, 5).map((prod) => (
                    <div key={prod.id} class="p-2.5 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-100/50 transition-colors text-xs flex flex-col gap-1">
                      <div class="flex justify-between items-start gap-2">
                        <span class="font-bold text-gray-800 line-clamp-1">{prod.name}</span>
                        <span class="text-red-600 font-extrabold flex-shrink-0">
                          {prod.currentStock} u.
                        </span>
                      </div>
                      <div class="text-[10px] text-gray-500 flex justify-between items-center">
                        <span>Min: {prod.minStock} u.</span>
                        <Link href="/reposicion/" class="text-[#6B21A8] font-bold hover:underline">
                          Pedir
                        </Link>
                      </div>
                    </div>
                  ))
                )}
                {alertCount.value > 5 && (
                  <div class="text-center pt-2">
                    <Link href="/reposicion/" class="text-xs text-[#6B21A8] font-bold hover:underline">
                      Ver todas las alertas (+{alertCount.value - 5})
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inicial del Usuario / Dropdown */}
        <div class="dropdown dropdown-end">
          <div 
            tabIndex={0} 
            role="button" 
            class="btn btn-ghost btn-circle avatar border border-gray-200 hover:border-[#6B21A8]/50 hover:bg-[#6B21A8]/10 transition-colors"
          >
            <div class="w-9 rounded-full bg-[#6B21A8]/10 flex items-center justify-center text-[#6B21A8] font-bold">
              U
            </div>
          </div>
          <ul tabIndex={0} class="mt-3 z-[50] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-2xl w-52 border border-gray-100">
            <li class="menu-title px-4 py-1.5 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              Mi Cuenta
            </li>
            <li>
              <Link 
                href="/configuracion/" 
                class="flex items-center gap-2 hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] px-4 py-2.5 rounded-xl text-gray-600 font-medium transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Configuración
              </Link>
            </li>
            <div class="h-px bg-gray-100 my-1"></div>
            <li>
              <button 
                onClick$={handleLogout} 
                class="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-xl font-medium transition-all w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
});

