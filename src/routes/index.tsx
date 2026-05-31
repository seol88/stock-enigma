import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
      <p class="text-base-content/70">Bienvenido al sistema de inventario Stock Enigma.</p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Stock Enigma - Dashboard",
  meta: [
    {
      name: "description",
      content: "Panel principal de gestión de inventario",
    },
  ],
};
