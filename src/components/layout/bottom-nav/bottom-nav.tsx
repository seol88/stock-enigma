import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export const BottomNav = component$(() => {
  const loc = useLocation();
  const isActive = (path: string) => loc.url.pathname === path || (path !== '/' && loc.url.pathname.startsWith(path));

  return (
    <div class="btm-nav md:hidden z-50 border-t border-gray-200 bg-white">
      <Link href="/" class={isActive('/') ? 'active text-[#6B21A8] bg-[#6B21A8]/5 border-t-2 border-[#6B21A8]' : 'text-gray-500 hover:text-[#6B21A8]'}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        <span class="text-xs font-semibold">Inicio</span>
      </Link>
      <Link href="/productos/" class={isActive('/productos') ? 'active text-[#6B21A8] bg-[#6B21A8]/5 border-t-2 border-[#6B21A8]' : 'text-gray-500 hover:text-[#6B21A8]'}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        <span class="text-xs font-semibold">Productos</span>
      </Link>
      <Link href="/reposicion/" class={isActive('/reposicion') ? 'active text-[#6B21A8] bg-[#6B21A8]/5 border-t-2 border-[#6B21A8]' : 'text-gray-500 hover:text-[#6B21A8]'}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <span class="text-xs font-semibold">Reposición</span>
      </Link>
    </div>
  );
});
