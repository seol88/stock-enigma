import { component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$, routeAction$, zod$, z, Form } from '@builder.io/qwik-city';
import { getDb } from '../../../db';
import { categories } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// Cargar categorías
export const useCategoriesLoader = routeLoader$(async (event) => {
  const db = getDb(event.env);
  let dbCategories = await db.select().from(categories).all();
  
  if (dbCategories.length === 0) {
    const defaultCats = [
      { id: '1', name: 'Librería' },
      { id: '2', name: 'Regalería' },
      { id: '3', name: 'Juguetería' },
      { id: '4', name: 'Arte' },
    ];
    for (const cat of defaultCats) {
      await db.insert(categories).values(cat).run();
    }
    dbCategories = await db.select().from(categories).all();
  }
  return dbCategories;
});

// Crear categoría
export const useCreateCategoryAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  const id = Math.random().toString(36).substring(2, 11);
  
  try {
    await db.insert(categories).values({
      id,
      name: data.name.trim(),
    }).run();
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Esta categoría ya existe.' };
    }
    return { success: false, error: 'Ocurrió un error al guardar la categoría.' };
  }
  return { success: true };
}, zod$({
  name: z.string().min(1, 'El nombre es obligatorio'),
}));

// Actualizar categoría
export const useUpdateCategoryAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  
  try {
    await db.update(categories)
      .set({ name: data.name.trim() })
      .where(eq(categories.id, data.id))
      .run();
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Este nombre de categoría ya existe.' };
    }
    return { success: false, error: 'Ocurrió un error al actualizar la categoría.' };
  }
  return { success: true };
}, zod$({
  id: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio'),
}));

// Eliminar categoría
export const useDeleteCategoryAction = routeAction$(async (data, event) => {
  const db = getDb(event.env);
  await db.delete(categories).where(eq(categories.id, data.id)).run();
  return { success: true };
}, zod$({
  id: z.string(),
}));

export default component$(() => {
  const categoriesList = useCategoriesLoader();
  const createAction = useCreateCategoryAction();
  const updateAction = useUpdateCategoryAction();
  const deleteAction = useDeleteCategoryAction();

  // Estados de edición local en cliente
  const editingId = useSignal<string | null>(null);
  const editingName = useSignal('');

  return (
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Gestionar Categorías</h2>
        <Link href="/productos/" class="btn btn-ghost btn-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a Productos
        </Link>
      </div>

      <div class="grid grid-cols-1 gap-6">
        
        {/* Formulario de Alta */}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-md font-bold text-gray-800 mb-4">Nueva Categoría</h3>
          {createAction.value?.error && (
            <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
              {createAction.value.error}
            </div>
          )}
          <Form action={createAction} class="flex gap-3 items-end">
            <div class="form-control w-full">
              <label class="label py-1"><span class="label-text font-bold text-gray-600">Nombre de la Categoría</span></label>
              <input 
                type="text" 
                name="name" 
                placeholder="Ej. Papelería, Embalajes..." 
                class="input bg-gray-50 border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl text-gray-900 w-full"
                required 
              />
            </div>
            <button type="submit" class="btn bg-[#6B21A8] hover:bg-[#581C87] text-white border-none rounded-xl px-6 h-12" disabled={createAction.isRunning}>
              Agregar
            </button>
          </Form>
        </div>

        {/* Listado de Categorías */}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-md font-bold text-gray-800">Categorías Registradas</h3>
          </div>
          {updateAction.value?.error && (
            <div class="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm">
              {updateAction.value.error}
            </div>
          )}
          <div class="overflow-x-auto">
            <table class="table w-full bg-transparent">
              <thead class="bg-gray-100/50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                <tr>
                  <th class="py-3 pl-6">Nombre</th>
                  <th class="py-3 pr-6 text-center w-40">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                {categoriesList.value.map((cat) => (
                  <tr key={cat.id} class="border-b border-gray-100 hover:bg-gray-50/50">
                    <td class="pl-6 py-4">
                      {editingId.value === cat.id ? (
                        <div class="flex gap-2 w-full">
                          <input 
                            type="text" 
                            class="input input-sm bg-gray-50 border-gray-300 text-gray-900 rounded-lg w-full max-w-xs focus:border-[#6B21A8]"
                            value={editingName.value}
                            onInput$={(e) => editingName.value = (e.target as HTMLInputElement).value}
                          />
                          <button 
                            class="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none rounded-lg"
                            onClick$={async () => {
                              if (editingName.value.trim()) {
                                await updateAction.submit({ id: cat.id, name: editingName.value });
                                editingId.value = null;
                              }
                            }}
                          >
                            Guardar
                          </button>
                          <button 
                            class="btn btn-xs bg-gray-300 hover:bg-gray-400 text-gray-700 border-none rounded-lg"
                            onClick$={() => editingId.value = null}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span class="font-bold text-gray-800">{cat.name}</span>
                      )}
                    </td>
                    <td class="pr-6 py-4 text-center">
                      {editingId.value !== cat.id && (
                        <div class="flex items-center justify-center gap-2">
                          <button 
                            class="btn btn-ghost btn-xs btn-square text-gray-500 hover:text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:scale-110 transition-transform"
                            onClick$={() => {
                              editingId.value = cat.id;
                              editingName.value = cat.name;
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            class="btn btn-ghost btn-xs btn-square text-gray-500 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-transform"
                            onClick$={async () => {
                              if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat.name}"?`)) {
                                await deleteAction.submit({ id: cat.id });
                              }
                            }}
                            disabled={deleteAction.isRunning}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Categorías - Librería Enigma',
  meta: [{ name: 'description', content: 'ABM de Categorías en Turso' }],
};
