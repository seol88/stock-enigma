import { component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  const code = useSignal('');
  const name = useSignal('');
  const category = useSignal('Librería');
  const price = useSignal('');
  const stock = useSignal('');
  const minStock = useSignal('5');

  return (
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Añadir Nuevo Producto</h2>
        <Link href="/productos/" class="btn btn-ghost btn-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </Link>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form class="space-y-6">
          
          {/* Subida de Imagen (Placeholder) */}
          <div class="flex flex-col md:flex-row gap-6 items-center border-b border-gray-100 pb-8">
            <div class="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#6B21A8] hover:text-[#6B21A8] transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span class="text-xs font-semibold">Subir Foto</span>
            </div>
            <div class="flex-1 text-center md:text-left">
              <h3 class="text-sm font-bold text-gray-800 mb-1">Imagen del Producto</h3>
              <p class="text-xs text-gray-500 mb-3">Recomendado: 500x500px. Formatos JPG, PNG o WEBP.</p>
              <button type="button" class="btn btn-sm bg-gray-100 border-none text-gray-600 hover:bg-gray-200 rounded-full px-4">Seleccionar Archivo</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Código (SKU)</span></label>
              <input type="text" placeholder="Ej. EN-1023" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl" bind:value={code} />
            </div>

            {/* Nombre */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Nombre del Producto</span></label>
              <input type="text" placeholder="Ej. Cuaderno A4..." class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl" bind:value={name} />
            </div>

            {/* Categoría */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Categoría</span></label>
              <select class="select bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl" bind:value={category}>
                <option value="Librería">Librería</option>
                <option value="Regalería">Regalería</option>
                <option value="Juguetería">Juguetería</option>
                <option value="Arte">Arte</option>
              </select>
            </div>

            {/* Precio */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Precio ($)</span></label>
              <input type="number" placeholder="0.00" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl" bind:value={price} />
            </div>

            {/* Stock Actual */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Stock Inicial</span></label>
              <input type="number" placeholder="0" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl" bind:value={stock} />
            </div>

            {/* Stock Mínimo */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Alerta de Stock Mínimo</span></label>
              <input type="number" placeholder="5" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl" bind:value={minStock} />
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/productos/" class="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-xl px-6">Cancelar</Link>
            <button type="button" class="btn bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-8 shadow-lg shadow-[#6B21A8]/30">Guardar Producto</button>
          </div>
        </form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nuevo Producto - Librería Enigma',
  meta: [{ name: 'description', content: 'Crear un nuevo producto' }],
};
