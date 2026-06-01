import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$, routeAction$, zod$, z, Form } from '@builder.io/qwik-city';
import { getDb } from '../../../../db';
import { products } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const useProductLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const { id } = event.params;
  const product = await db.select().from(products).where(eq(products.id, id)).get();
  
  if (!product) {
    throw event.redirect(303, '/productos/');
  }
  
  return product;
});

export const useUpdateProductAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const { id, code, name, category, price, currentStock, minStock } = data;

  try {
    await db.update(products)
      .set({
        code,
        name,
        category,
        price,
        currentStock,
        minStock,
      })
      .where(eq(products.id, id))
      .run();
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'El código SKU ya existe en la base de datos.' };
    }
    return { success: false, error: 'Ocurrió un error al actualizar el producto.' };
  }

  throw event.redirect(303, '/productos/');
}, zod$({
  id: z.string(),
  code: z.string().min(1, 'El código es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  category: z.string(),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  currentStock: z.coerce.number().min(0, 'El stock inicial debe ser mayor o igual a 0'),
  minStock: z.coerce.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
}));

export default component$(() => {
  const productLoader = useProductLoader();
  const updateProductAction = useUpdateProductAction();
  const product = productLoader.value;

  return (
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Editar Producto</h2>
        <Link href="/productos/" class="btn btn-ghost btn-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </Link>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {updateProductAction.value?.error && (
          <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
            {updateProductAction.value.error}
          </div>
        )}

        <Form action={updateProductAction} class="space-y-6">
          <input type="hidden" name="id" value={product.id} />
          
          {/* Subida de Imagen (Placeholder) */}
          <div class="flex flex-col md:flex-row gap-6 items-center border-b border-gray-100 pb-8">
            <div class="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#6B21A8] hover:text-[#6B21A8] transition-colors cursor-pointer">
              <img src={product.imageUrl || "/logo.webp"} alt={product.name} class="w-full h-full object-contain p-1 rounded-2xl" />
            </div>
            <div class="flex-1 text-center md:text-left">
              <h3 class="text-sm font-bold text-gray-800 mb-1">Imagen del Producto</h3>
              <p class="text-xs text-gray-500 mb-3">Recomendado: 500x500px. Formatos JPG, PNG o WEBP.</p>
              <button type="button" class="btn btn-sm bg-gray-100 border-none text-gray-600 hover:bg-gray-200 rounded-full px-4" disabled>Seleccionar Archivo</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Código (SKU)</span></label>
              <input type="text" name="code" value={product.code} placeholder="Ej. EN-1023" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Nombre */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Nombre del Producto</span></label>
              <input type="text" name="name" value={product.name} placeholder="Ej. Cuaderno A4..." class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Categoría */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Categoría</span></label>
              <select name="category" value={product.category || 'Librería'} class="select bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900">
                <option value="Librería">Librería</option>
                <option value="Regalería">Regalería</option>
                <option value="Juguetería">Juguetería</option>
                <option value="Arte">Arte</option>
              </select>
            </div>

            {/* Precio */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Precio ($)</span></label>
              <input type="number" step="0.01" name="price" value={product.price} placeholder="0.00" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Stock Actual */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Stock Actual</span></label>
              <input type="number" name="currentStock" value={product.currentStock} placeholder="0" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Stock Mínimo */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Alerta de Stock Mínimo</span></label>
              <input type="number" name="minStock" value={product.minStock} placeholder="5" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/productos/" class="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-xl px-6">Cancelar</Link>
            <button type="submit" class="btn bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-8 shadow-lg shadow-[#6B21A8]/30" disabled={updateProductAction.isRunning}>
              {updateProductAction.isRunning ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Editar Producto - Librería Enigma',
  meta: [{ name: 'description', content: 'Modificar producto en Turso' }],
};
