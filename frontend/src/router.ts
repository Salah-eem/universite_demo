import { createRouter, createWebHistory } from "vue-router";
import BulletinsPage from "./pages/BulletinsPage.vue";
import AnomaliesPage from "./pages/AnomaliesPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: BulletinsPage },
    { path: "/anomalies", component: AnomaliesPage },
  ],
});
