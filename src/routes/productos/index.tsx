import { component$, useSignal, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const updateStatus = (stock: number) => {
  if (stock <= 0) return 'Sin Stock';
  if (stock <= 15) return 'Bajo Stock';
  return 'Disponible';
};

export default component$(() => {
  const searchQuery = useSignal('');
  const activeCategory = useSignal('Todos');

  const categories = ['Todos', 'Librería', 'Regalería', 'Juguetería', 'Arte'];

  const state = useStore({
    products: [
      { code: 'EN-7821', name: 'Cuaderno Universitario', category: 'Librería', price: 4500, stock: 124, status: 'Disponible' },
      { code: 'EN-4492', name: 'Lapicera Gel Violeta', category: 'Librería', price: 850, stock: 12, status: 'Bajo Stock' },
      { code: 'EN-3185', name: 'Cartulina Fluorescente', category: 'Librería', price: 320, stock: 0, status: 'Sin Stock' },
      { code: 'EN-9022', name: 'Taza Personalizada', category: 'Regalería', price: 8200, stock: 45, status: 'Disponible' },
    ]
  }, { deep: true });

  return (
    <div class="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div class="flex flex-col xl:flex-row gap-4 justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl shadow-sm border border-gray-100">
        <div class="relative w-full xl:max-w-xs flex-shrink-0">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            class="input w-full pl-10 bg-white border-gray-200 focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] rounded-xl h-11 transition-all text-gray-900"
            bind:value={searchQuery}
          />
        </div>
        
        <div class="flex flex-wrap items-center justify-start xl:justify-end gap-2 w-full">
          {categories.map((cat) => (
            <button 
              key={cat}
              class={`btn btn-sm rounded-full border-none px-4 font-medium transition-colors ${activeCategory.value === cat ? 'bg-[#D946EF]/20 text-[#6B21A8]' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
              onClick$={() => activeCategory.value = cat}
            >
              {cat}
            </button>
          ))}
          <div class="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
          <button class="btn btn-sm bg-white border border-gray-200 text-gray-700 rounded-full px-4 hover:bg-gray-50 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros
          </button>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div class="bg-[#FDFBF7] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full bg-transparent">
            {/* Cabecera */}
            <thead class="bg-gray-100/50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th class="py-4 pl-6 bg-transparent">Código</th>
                <th class="py-4 bg-transparent">Producto</th>
                <th class="py-4 text-center bg-transparent">Categoría</th>
                <th class="py-4 text-right bg-transparent">Precio</th>
                <th class="py-4 text-center bg-transparent">Stock Actual</th>
                <th class="py-4 text-center bg-transparent">Estado</th>
                <th class="py-4 pr-6 text-center bg-transparent">Acciones</th>
              </tr>
            </thead>
            {/* Cuerpo */}
            <tbody class="text-sm">
              {state.products.map((p, index) => (
                <tr key={p.code} class="border-b border-gray-100 bg-transparent hover:bg-transparent">
                  <td class="pl-6 font-medium text-gray-900 bg-transparent">{p.code}</td>
                  <td class="bg-transparent">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        <img src="/logo.webp" alt={p.name} class="w-full h-full object-contain p-1" />
                      </div>
                      <span class="font-bold text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td class="text-center bg-transparent">
                    <span class="px-3 py-1 bg-white shadow-sm border border-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">
                      {p.category}
                    </span>
                  </td>
                  <td class="text-right font-bold text-[#6B21A8] bg-transparent">
                    ${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td class="text-center font-medium text-gray-700 bg-transparent">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        class="btn btn-xs btn-circle btn-ghost text-red-500 hover:bg-red-50 text-lg leading-none pb-1"
                        onClick$={() => {
                          if (state.products[index].stock > 0) {
                            state.products[index].stock--;
                            state.products[index].status = updateStatus(state.products[index].stock);
                          }
                        }}
                      >-</button>
                      <span class="w-8 text-center">{p.stock}</span>
                      <button 
                        class="btn btn-xs btn-circle btn-ghost text-green-600 hover:bg-green-50 text-lg leading-none pb-1"
                        onClick$={() => {
                          state.products[index].stock++;
                          state.products[index].status = updateStatus(state.products[index].stock);
                        }}
                      >+</button>
                    </div>
                  </td>
                  <td class="text-center bg-transparent">
                    <div class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-white ${
                      p.status === 'Disponible' ? 'text-green-700 border-green-200' : 
                      p.status === 'Bajo Stock' ? 'text-[#6B21A8] border-[#D946EF]/30' : 
                      'text-red-700 border-red-200'
                    }`}>
                      <div class={`w-1.5 h-1.5 rounded-full ${
                        p.status === 'Disponible' ? 'bg-green-500' : 
                        p.status === 'Bajo Stock' ? 'bg-[#6B21A8]' : 
                        'bg-red-500'
                      }`}></div>
                      {p.status}
                    </div>
                  </td>
                  <td class="pr-6 bg-transparent">
                    <div class="flex items-center justify-center gap-2">
                      <button class="btn btn-ghost btn-sm btn-square text-gray-500 hover:text-[#6B21A8] hover:bg-[#6B21A8]/10 hover:scale-110 transition-transform" onClick$={() => alert('Próximamente: Editar producto')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button class="btn btn-ghost btn-sm btn-square text-gray-500 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-transform" onClick$={() => alert('Próximamente: Eliminar producto')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer de la Tabla (Paginación) */}
        <div class="bg-gray-100/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <span class="text-sm text-gray-500 font-medium">Mostrando 1 a 4 de 1.250 productos</span>
          <div class="join">
            <button class="join-item btn btn-sm bg-white border-gray-200 text-gray-500 hover:bg-gray-50">«</button>
            <input class="join-item btn btn-sm bg-white border-gray-200 checked:bg-[#6B21A8] checked:text-white checked:border-[#6B21A8] hover:bg-gray-50 focus:outline-none" type="radio" name="options" aria-label="1" checked />
            <input class="join-item btn btn-sm bg-white border-gray-200 checked:bg-[#6B21A8] checked:text-white checked:border-[#6B21A8] hover:bg-gray-50 focus:outline-none" type="radio" name="options" aria-label="2" />
            <input class="join-item btn btn-sm bg-white border-gray-200 checked:bg-[#6B21A8] checked:text-white checked:border-[#6B21A8] hover:bg-gray-50 focus:outline-none" type="radio" name="options" aria-label="3" />
            <button class="join-item btn btn-sm bg-white border-gray-200 text-gray-500 hover:bg-gray-50">»</button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Superiores / Inferiores */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-[#8B5CF6] to-[#6B21A8] rounded-2xl p-6 text-white shadow-lg shadow-[#6B21A8]/20 relative overflow-hidden">
          <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div class="flex justify-between items-start mb-4 relative z-10">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <span class="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">+12% este mes</span>
          </div>
          <h3 class="text-3xl font-extrabold mb-1 relative z-10">1.250</h3>
          <p class="text-white/80 text-sm font-medium relative z-10">Productos Totales</p>
        </div>

        <div class="bg-[#E2E8F0] rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#6B21A8]/30 transition-colors">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
          </div>
          <h3 class="text-3xl font-extrabold text-gray-900 mb-1">18</h3>
          <p class="text-gray-600 text-sm font-medium">Bajo Stock / Crítico</p>
        </div>

        <div class="bg-[#E9D5FF] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-xl bg-[#D8B4FE] flex items-center justify-center text-[#6B21A8]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 class="text-3xl font-extrabold text-[#6B21A8] mb-1">$1.8M</h3>
          <p class="text-[#6B21A8]/80 text-sm font-medium">Valor Inventario</p>
        </div>
      </div>
      
      {/* Botón Flotante para Móviles (Add Product) - Opcional si queremos accion rapida */}
      <Link href="/productos/nuevo" class="fixed bottom-20 right-4 md:hidden w-14 h-14 bg-[#6B21A8] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#6B21A8]/40 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
      </Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Productos - Librería Enigma',
  meta: [{ name: 'description', content: 'Gestión de productos' }],
};
