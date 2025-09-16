# UNIVERSITE_DEMO

## Présentation

UNIVERSITE_DEMO est une application web complète pour la gestion universitaire, composée d’un backend Node.js/TypeScript et d’un frontend Vue.js. Elle permet de gérer les anomalies, bulletins et autres entités liées à l’université via une interface moderne et une API REST.

---

## Structure du projet

```
backend/
  ├── src/
  │   ├── db.ts
  │   ├── routes.ts
  │   ├── server.ts
  │   ├── services/
  │   │   ├── anomalyService.ts
  │   │   └── bulletinService.ts
  │   └── utils/
  │       └── normalize.ts
  ├── data/universite_demo.sqlite
  ├── package.json
  └── tsconfig.json
frontend/
  ├── src/
  │   ├── App.vue
  │   ├── main.ts
  │   ├── router.ts
  │   ├── components/
  │   ├── pages/
  │   │   ├── AnomaliesPage.vue
  │   │   └── BulletinsPage.vue
  │   └── services/api.ts
  ├── public/
  ├── package.json
  └── vite.config.ts
```

---

## Backend

- **Technologies** : Node.js, TypeScript, Express, SQLite
- **Fonctionnalités** :
  - API REST pour anomalies, bulletins, etc.
  - Services pour la logique métier
  - Base de données SQLite
- **Démarrage** :
  1. Installer les dépendances : `npm install` dans le dossier `backend/`
  2. Lancer le serveur : `npm start` ou `ts-node src/server.ts`

---

## Frontend

- **Technologies** : Vue.js, Vite, TypeScript
- **Fonctionnalités** :
  - Interface utilisateur pour gérer les anomalies et bulletins
  - Routing entre les pages
  - Appels API vers le backend
- **Démarrage** :
  1. Installer les dépendances : `npm install` dans le dossier `frontend/`
  2. Lancer le serveur de développement : `npm run dev`
  3. Accéder à l’application via `http://localhost:5173` (par défaut)

---

## Fonctionnement général

1. **L’utilisateur** interagit avec l’interface web (frontend).
2. **Le frontend** envoie des requêtes API au backend pour récupérer ou modifier les données.
3. **Le backend** traite les requêtes, interagit avec la base de données et renvoie les résultats au frontend.

---

