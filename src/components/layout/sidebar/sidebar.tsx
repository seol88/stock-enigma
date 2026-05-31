import { component$, $ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { authClient } from '../../../lib/auth-client';

export const Sidebar = component$(() => {
  const loc = useLocation();

  const handleLogout = $(async () => {
    await authClient.signOut();
    window.location.href = '/login';
  });

  const isActive = (path: string) => loc.url.pathname === path || (path !== '/' && loc.url.pathname.startsWith(path));

  return (
    <aside class="hidden md:flex w-72 flex-col bg-white border-r border-gray-200 h-screen sticky top-0 shadow-sm z-30">
      {/* Menú Principal */}
      <div class="p-4 flex-1 flex flex-col">
        <div class="flex items-center gap-3 px-4 mb-8 mt-2">
          <div class="w-10 h-10 rounded-full overflow-hidden shadow-md border border-gray-100 flex-shrink-0 bg-white">
            <img src="/logo.webp" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <h1 class="text-[22px] font-extrabold text-[#6B21A8] tracking-tight">Librería Enigma</h1>
        </div>
        
        <ul class="menu menu-md gap-3">
          <li>
            <Link href="/" class={`hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-all rounded-xl py-3 ${isActive('/') ? 'active bg-[#6B21A8]/10 text-[#6B21A8] font-bold shadow-sm border border-[#6B21A8]/20' : 'text-gray-600 font-medium'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/productos/" class={`hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-all rounded-xl py-3 ${isActive('/productos') ? 'active bg-[#6B21A8]/10 text-[#6B21A8] font-bold shadow-sm border border-[#6B21A8]/20' : 'text-gray-600 font-medium'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Productos
            </Link>
          </li>
          <li>
            <Link href="/reposicion/" class={`hover:bg-[#6B21A8]/10 hover:text-[#6B21A8] transition-all rounded-xl py-3 ${isActive('/reposicion') ? 'active bg-[#6B21A8]/10 text-[#6B21A8] font-bold shadow-sm border border-[#6B21A8]/20' : 'text-gray-600 font-medium'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Panel de Reposición
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Footer del Menú (Usuario y Logout) */}
      <div class="p-4 border-t border-gray-100">
        <button 
          onClick$={handleLogout}
          class="btn btn-ghost w-full justify-start text-gray-500 hover:bg-red-50 hover:text-red-600 gap-3 transition-colors rounded-xl font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
});
