<template>
  <div class="min-h-dvh bg-gray-50">
    <header class="border-b bg-white sticky top-0 z-10">
      <div class="container-max py-4 flex items-center justify-between">
        <div class="text-xl font-semibold">Bulletins & Qualité</div>
        <nav class="flex gap-2">
          <RouterLink to="/" class="px-4 py-2 rounded-xl" :class="linkClass('/')">Bulletins</RouterLink>
          <RouterLink to="/anomalies" class="px-4 py-2 rounded-xl" :class="linkClass('/anomalies')">Anomalies</RouterLink>
        </nav>
      </div>
    </header>

    <main class="container-max py-6">
      <RouterView />
    </main>

    <footer class="container-max py-6 text-sm text-gray-500">
      Source API : <code>{{ apiBase }}</code>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute, RouterLink, RouterView } from "vue-router";

const route = useRoute();
const apiBase = import.meta.env.VITE_API_BASE;

function linkClass(path: string) {
  return route.path === path ? "bg-black text-white" : "hover:bg-black/5";
}
</script>
