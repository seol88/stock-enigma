import { component$, Slot } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Sidebar } from "../components/layout/sidebar/sidebar";
import { Header } from "../components/layout/header/header";
import { BottomNav } from "../components/layout/bottom-nav/bottom-nav";

export default component$(() => {
  const loc = useLocation();
  const isLoginPage = loc.url.pathname.startsWith('/login');
  const isPrintPage = loc.url.pathname.startsWith('/reposicion/pedidos/') && loc.url.pathname !== '/reposicion/pedidos' && loc.url.pathname !== '/reposicion/pedidos/';

  if (isLoginPage) {
    return <Slot />;
  }

  if (isPrintPage) {
    return (
      <div class="min-h-screen bg-[#FDFBF7] p-4 md:p-8 print:p-0 print:bg-white">
        <Slot />
      </div>
    );
  }

  return (
    <div class="flex h-screen bg-[#FDFBF7]">
      <Sidebar />
      <div class="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Contenido principal: padding-bottom extra para mobile para que el bottom nav no tape contenido */}
        <main class="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Slot />
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
});
