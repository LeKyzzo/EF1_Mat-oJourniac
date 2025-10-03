## ESN Portal – Version React

Portage complet du projet **E1_HTML** vers une application React propulsée par Vite. Tout le design, la navigation et les interactions (recherche, listing des utilisateurs, détail avec todos) ont été recréés pour coller au comportement d’origine tout en profitant d’une architecture composants.

### Périmètre fonctionnel

- Listing des utilisateurs avec recherche instantanée sur les profils et leurs tâches.
- Page détail avec informations enrichies, filtres de tâches et formulaire d’ajout (mocké via JSONPlaceholder).
- Loader global, navigation responsive et styles strictement alignés sur la version HTML.

### Prérequis

- Node.js 18 ou supérieur
- npm 9+ (fourni avec Node 18)

### Installation

```powershell
cd "c:\Users\journ\Downloads\EF1\EF1_Mat-oJourniac\E2_REACT\projet-e2"
npm install
```

### Lancer le serveur de développement

```powershell
npm run dev
```

Le serveur Vite affiche l’URL locale (par défaut http://localhost:5173). Ouvrez-la dans le navigateur pour retrouver l’application.

### Build de production

```powershell
npm run build
```

Le bundle optimisé est généré dans `dist/`. Pour un aperçu rapide du build :

```powershell
npm run preview
```

### Scripts utiles

- `npm run lint` : lance ESLint sur le projet (si vous avez besoin de vérifier le style de code).
- `npm run dev -- --host` : expose le serveur de dev sur le réseau local (pratique pour tester sur mobile).

### Structure rapide

```
src/
├── components/   # Header, UserCard, TodoList, etc.
├── pages/        # Home, UserDetail, NotFound
├── services/     # Accès API JSONPlaceholder
├── styles/       # CSS repris du projet E1
└── main.jsx      # Bootstrap React + Router
```

Les commentaires ajoutés dans les fichiers expliquent mes choix d’implémentation et les adaptations par rapport à la version statique.

### API

L’application s’appuie sur [JSONPlaceholder](https://jsonplaceholder.typicode.com) pour récupérer utilisateurs et todos. Les créations de tâches sont simulées : la réponse de l’API est intégrée côté client mais n’est pas persistée côté serveur.
