<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">Anomalies</h1>

    <div class="card grid gap-3 md:grid-cols-3">
      <input class="input" v-model="q" placeholder="Rechercher (matricule, année, détail)" />
      <select class="input" v-model="type">
        <option value="">Tous les types</option>
        <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
      </select>
      <div class="text-sm text-gray-500 self-center">{{ filtered.length }} résultat(s)</div>
    </div>

    <div v-if="loading" class="card">Chargement…</div>
    <div v-else-if="error" class="card text-red-700">Erreur: {{ error }}</div>
    <div v-else-if="filtered.length === 0" class="card">Aucune anomalie trouvée.</div>

    <div class="card overflow-x-auto hidden md:block" v-if="!loading && !error && filtered.length">
      <table class="min-w-full text-sm">
        <thead class="text-left text-gray-600">
          <tr>
            <th class="p-2">Type</th>
            <th class="p-2">Matricule</th>
            <th class="p-2">Année</th>
            <th class="p-2">Détail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in filtered" :key="i" class="hover:bg-gray-50">
            <td class="p-2 font-mono">{{ a.type }}</td>
            <td class="p-2 font-mono">{{ a.matricule }}</td>
            <td class="p-2">{{ a.annee ?? "—" }}</td>
            <td class="p-2">
              <pre class="text-xs whitespace-pre-wrap">{{ pretty(a.detail) }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden grid gap-3" v-if="!loading && !error && filtered.length">
      <div v-for="(a, i) in filtered" :key="i" class="card space-y-1">
        <div class="text-xs font-mono">{{ a.type }}</div>
        <div class="font-mono text-sm">{{ a.matricule }} — {{ a.annee ?? "—" }}</div>
        <pre class="text-xs whitespace-pre-wrap">{{ pretty(a.detail) }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { api, type Anomaly } from "../services/api";
import { computed, onMounted, ref } from "vue";

const TYPES = [
  "NOTE_SANS_INSCRIPTION",
  "COURS_INCONNU",
  "INSCRIPTION_SANS_COURS",
  "DUPLICATA_NOTE",
  "NOTE_SANS_CREDIT",
] as const;

const data = ref<Anomaly[] | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const type = ref<string>("");
const q = ref("");

onMounted(async () => {
  try {
    loading.value = true;
    data.value = await api.getAnomalies();
    error.value = null;
  } catch (e: any) {
    error.value = e?.message ?? "Erreur";
  } finally {
    loading.value = false;
  }
});

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase();
  return (data.value ?? []).filter((a) => {
    const matchType = !type.value || a.type === type.value;
    const txt = `${a.matricule} ${a.annee ?? ""} ${JSON.stringify(a.detail)}`.toLowerCase();
    const matchText = !needle || txt.includes(needle);
    return matchType && matchText;
  });
});

function pretty(obj: Record<string, unknown>) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}
</script>
