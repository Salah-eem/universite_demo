<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">Bulletins</h1>

    <div class="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <input
        v-model="q"
        placeholder="Rechercher (matricule, nom, prenom)"
        class="input"
      />
      <div class="flex gap-3 items-center">
        <select class="input" v-model="annee">
          <option value="">Toutes les années</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <a class="btn" :href="csvUrl" target="_blank">Export CSV</a>
      </div>
    </div>

    <div v-if="loading" class="card">Chargement…</div>
    <div v-else-if="error" class="card text-red-700">Erreur: {{ error }}</div>
    <div v-else-if="filtered.length === 0" class="card">Aucun bulletin trouvé.</div>

    <!-- Desktop table -->
    <div class="hidden md:block card overflow-x-auto" v-if="!loading && !error && filtered.length">
      <table class="min-w-full text-sm">
        <thead class="text-left text-gray-600">
          <tr>
            <th class="p-2">Matricule</th>
            <th class="p-2">Nom</th>
            <th class="p-2">Prénom</th>
            <th class="p-2">Année</th>
            <th class="p-2">ECTS inscrits</th>
            <th class="p-2">ECTS obtenus</th>
            <th class="p-2">Moyenne</th>
            <th class="p-2">Réussite</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="`${b.matricule}-${b.annee}`" class="hover:bg-gray-50">
            <td class="p-2 font-mono">{{ b.matricule }}</td>
            <td class="p-2">{{ b.nom }}</td>
            <td class="p-2">{{ b.prenom }}</td>
            <td class="p-2">{{ b.annee }}</td>
            <td class="p-2">{{ b.ects_total_inscrits }}</td>
            <td class="p-2">{{ b.ects_obtenus }}</td>
            <td class="p-2">{{ b.moyenne_ponderee ?? "—" }}</td>
            <td class="p-2">
              <span v-if="b.reussite" class="badge-green">Réussi</span>
              <span v-else class="badge-red">Échec</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden grid gap-3" v-if="!loading && !error && filtered.length">
      <div v-for="b in filtered" :key="`${b.matricule}-${b.annee}`" class="card space-y-1">
        <div class="flex items-center justify-between">
          <div class="font-semibold">{{ b.nom }} {{ b.prenom }}</div>
          <span :class="b.reussite ? 'badge-green' : 'badge-red'">
            {{ b.reussite ? 'Réussi' : 'Échec' }}
          </span>
        </div>
        <div class="text-sm text-gray-600 font-mono">{{ b.matricule }} — Année {{ b.annee }}</div>
        <div class="text-sm">ECTS inscrits : {{ b.ects_total_inscrits }}</div>
        <div class="text-sm">ECTS obtenus : {{ b.ects_obtenus }}</div>
        <div class="text-sm">Moyenne : {{ b.moyenne_ponderee ?? "—" }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api, type Bulletin } from "../services/api";

const data = ref<Bulletin[] | null>(null);
const q = ref("");
const annee = ref("");

const loading = ref(true);
const error = ref<string | null>(null);
const csvUrl = api.csvBulletinsUrl;

onMounted(async () => {
  try {
    loading.value = true;
    data.value = await api.getBulletins();
    error.value = null;
  } catch (e: any) {
    error.value = e?.message ?? "Erreur";
  } finally {
    loading.value = false;
  }
});

const years = computed(() => {
  const s = new Set<string>();
  (data.value ?? []).forEach((b) => s.add(String(b.annee)));
  return Array.from(s).sort();
});

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase();
  return (data.value ?? []).filter((b) => {
    const matchesText =
      !needle ||
      b.matricule.toLowerCase().includes(needle) ||
      b.nom.toLowerCase().includes(needle) ||
      b.prenom.toLowerCase().includes(needle);
    const matchesYear = !annee.value || String(b.annee) === annee.value;
    return matchesText && matchesYear;
  });
});
</script>
