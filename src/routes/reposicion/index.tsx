import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="p-2 md:p-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center max-w-2xl mx-auto mt-10">
        <div class="w-16 h-16 bg-[#6B21A8]/10 text-[#6B21A8] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Panel de Reposición</h2>
        <p class="text-gray-500 mb-6">Esta sección está en construcción. Aquí verás el listado de productos que necesitan reponerse en el inventario.</p>
        <button class="btn bg-gray-100 text-gray-600 hover:bg-gray-200 border-none rounded-xl px-8">Generar Reporte (Pronto)</button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Reposición - Librería Enigma',
  meta: [
    {
      name: 'description',
      content: 'Panel de reposición de productos',
    },
  ],
};
