import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$, routeAction$, zod$, z, Form } from '@builder.io/qwik-city';
import { getDb } from '../../../db';
import { products, categories as categoriesTable } from '../../../db/schema';

// Cargar categorías dinámicas
export const useCategoriesLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  let dbCategories = await db.select().from(categoriesTable).all();
  if (dbCategories.length === 0) {
    const defaultCats = [
      { id: '1', name: 'Librería' },
      { id: '2', name: 'Regalería' },
      { id: '3', name: 'Juguetería' },
      { id: '4', name: 'Arte' },
    ];
    for (const cat of defaultCats) {
      await db.insert(categoriesTable).values(cat).run();
    }
    dbCategories = await db.select().from(categoriesTable).all();
  }
  return dbCategories;
});

export const useCreateProductAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  
  // Generar ID único
  const id = Math.random().toString(36).substring(2, 11);
  
  try {
    await db.insert(products).values({
      id,
      code: data.code,
      name: data.name,
      category: data.category,
      price: data.price,
      currentStock: data.currentStock,
      minStock: data.minStock,
      status: 'active',
      imageUrl: '/logo.webp', // Placeholder
    }).run();
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'El código SKU ya existe en la base de datos.' };
    }
    return { success: false, error: 'Ocurrió un error al guardar el producto.' };
  }
  
  throw event.redirect(303, '/productos/');
}, zod$({
  code: z.string().min(1, 'El código es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  category: z.string(),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  currentStock: z.coerce.number().min(0, 'El stock inicial debe ser mayor o igual a 0'),
  minStock: z.coerce.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
}));

export default component$(() => {
  const createProductAction = useCreateProductAction();
  const categoriesLoader = useCategoriesLoader();

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
        {createProductAction.value?.error && (
          <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
            {createProductAction.value.error}
          </div>
        )}

        <Form action={createProductAction} class="space-y-6">
          
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
              <input type="text" name="code" placeholder="Ej. EN-1023" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Nombre */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Nombre del Producto</span></label>
              <input type="text" name="name" placeholder="Ej. Cuaderno A4..." class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Categoría */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Categoría</span></label>
              <select name="category" class="select bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900">
                {categoriesLoader.value.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Precio ($)</span></label>
              <input type="number" step="0.01" name="price" placeholder="0.00" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Stock Actual */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Stock Inicial</span></label>
              <input type="number" name="currentStock" placeholder="0" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>

            {/* Stock Mínimo */}
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold text-gray-700">Alerta de Stock Mínimo</span></label>
              <input type="number" name="minStock" placeholder="5" defaultValue="5" class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900" required />
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/productos/" class="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-xl px-6">Cancelar</Link>
            <button type="submit" class="btn bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-8 shadow-lg shadow-[#6B21A8]/30" disabled={createProductAction.isRunning}>
              {createProductAction.isRunning ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nuevo Producto - Librería Enigma',
  meta: [{ name: 'description', content: 'Crear un nuevo producto en Turso' }],
};
