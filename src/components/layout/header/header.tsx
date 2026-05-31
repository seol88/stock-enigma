import { component$, $ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { authClient } from '../../../lib/auth-client';

export const Header = component$(() => {
  const loc = useLocation();
  
  const getPageTitle = () => {
    const path = loc.url.pathname;
    if (path.startsWith('/productos')) return 'Gestión de Productos';
    if (path.startsWith('/reposicion')) return 'Panel de Reposición';
    return 'Dashboard General';
  };

  const handleLogout = $(async () => {
    await authClient.signOut();
    window.location.href = '/login';
  });

  return (
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm flex items-center h-16 px-4 justify-between gap-4">
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
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-circle hidden md:flex text-gray-500 hover:text-[#6B21A8]">
          <div class="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span class="badge badge-xs badge-error indicator-item"></span>
          </div>
        </button>
        <div class="dropdown dropdown-end">
          <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar border border-gray-200 hover:border-[#6B21A8]/30 transition-colors">
            <div class="w-9 rounded-full bg-[#6B21A8]/10 flex items-center justify-center text-[#6B21A8] font-bold">
              U
            </div>
          </div>
          <ul tabIndex={0} class="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-white rounded-box w-52 border border-gray-100">
            <li class="md:hidden"><a onClick$={handleLogout} class="text-red-600 font-medium">Cerrar Sesión</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
});
