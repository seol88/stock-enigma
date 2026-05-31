import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="p-2 md:p-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center max-w-2xl mx-auto mt-10">
        <div class="w-16 h-16 bg-[#6B21A8]/10 text-[#6B21A8] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Módulo de Productos</h2>
        <p class="text-gray-500 mb-6">Esta sección está en construcción. Aquí podrás gestionar tu inventario, agregar, editar y eliminar productos pronto.</p>
        <button class="btn bg-[#6B21A8] hover:bg-[#581c87] text-white border-none rounded-xl px-8">Añadir Nuevo Producto</button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Productos - Librería Enigma',
  meta: [
    {
      name: 'description',
      content: 'Gestión de productos',
    },
  ],
};
