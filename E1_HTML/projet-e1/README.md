# Portail Web de Gestion de Projets (E1)

Projet pédagogique (niveau 3e année) : réalisation d'une interface web statique et dynamique sans framework (HTML5 / CSS3 / JavaScript ES6). Données consommées depuis l'API publique JSONPlaceholder.

## 🎯 Objectifs
- Visualiser les utilisateurs (collaborateurs) et un aperçu de leurs tâches
- Accéder au détail d'un utilisateur et à toutes ses tâches (todos)
- Ajouter une nouvelle tâche (simulation via POST JSONPlaceholder)
- Rechercher / filtrer
- Interface responsive + accessibilité de base

## 🗂 Structure du projet
```
projet-e1/
├── index.html           # Page d'accueil (liste des utilisateurs)
├── user.html            # Détail d'un utilisateur + todos
├── css/
│   ├── style.css        # Styles principaux / design system
│   └── responsive.css   # Media queries additionnelles
├── js/
│   ├── utils.js         # Helpers génériques (DOM, loader, a11y...)
│   ├── api.js           # Couche d'accès API centralisée
│   └── main.js          # Logique pages (accueil + détail)
└── assets/
    └── images/          # (placeholder pour logos / visuels)
```

## 🌐 API utilisée
Base : https://jsonplaceholder.typicode.com
| Méthode | Endpoint | Usage |
|---------|----------|-------|
| GET | /users | Liste utilisateurs |
| GET | /users/:id | Détail utilisateur |
| GET | /todos?userId={id} | Tâches d'un utilisateur |
| POST | /todos | Création (simulée) d'une tâche |

> NOTE : L'API ne persiste pas réellement les nouvelles tâches. On simule localement en ajoutant la tâche dans l'état courant.

## 🛠 Technologies / Contraintes
- HTML5 sémantique (header, main, section, article, nav, footer)
- CSS3 : Flex / Grid, variables CSS, transitions, dark design, mobile-first
- JavaScript ES6 : modules, fetch, async/await, DOM dynamique, gestion d'état minimaliste
- Accessibilité : aria-label, aria-live, roles, focus visible, contrastes
- Aucune librairie externe

## 📱 Responsive (mobile-first)
Breakpoints :
- < 768px : Mobile
- ≥ 768px : Tablette
- ≥ 1024px : Desktop

## ✨ Fonctionnalités principales
Accueil :
- Chargement des utilisateurs
- Pré-chargement partiel de quelques todos (aperçu)
- Recherche temps réel (nom, email, entreprise)
- Animation reveal au scroll (IntersectionObserver)
- Navigation responsive (menu hamburger)

Détail utilisateur :
- Récupération paramètre id (URLSearchParams)
- Affichage informations (entreprise, ville, site web...)
- Liste complète des todos avec status et interaction checkbox (simulation)
- Filtrage : Toutes / En cours / Terminées
- Ajout de tâche (validation côté client)

## 🔐 Accessibilité / UX
- Loader global (aria-hidden + aria-live)
- Sections mises à jour : aria-live="polite"
- Boutons de filtre : aria-pressed
- Messages formulaire : role="alert"
- Focus states visibles uniquement au clavier

## 🧩 Organisation du code
- `api.js` : fonction générique `apiFetch` + wrappers dédiés
- `main.js` : logique séparée par page (initHome / initUserDetail)
- `utils.js` : utilitaires (sélecteurs, création éléments, loader, reveal, etc.)
- `state` minimal en mémoire (users / todosByUser / activeFilter)

## 🚀 Lancer le projet
Aucun build requis. Ouvrir simplement `index.html` dans un navigateur moderne (recommandé : via une petite extension Live Server pour éviter des soucis CORS). Sur Windows PowerShell :

```powershell
# Ouvrir le dossier dans l'explorateur
ii .\projet-e1\index.html
```

Ou clic-droit > "Open with Live Server" si vous utilisez VS Code + extension.

## 🧪 Tests manuels conseillés
1. Affichage de la liste utilisateurs sur `index.html`
2. Recherche avec un terme (ex: "Leanne") -> filtrage immédiat
3. Clic sur "Détails" -> navigation `user.html?id=1`
4. Ajout d'une tâche -> apparaît en haut de la liste
5. Basculer une tâche (checkbox) -> style barré + filtre reflète
6. Filtrer (En cours / Terminées)
7. Redimensionner la fenêtre < 768px -> menu hamburger fonctionnel

## 📸 Captures d'écran (à ajouter)
Placer vos captures dans `assets/images/` :
- accueil.png
- detail-utilisateur.png
- ajout-tache.png

## 🧹 Améliorations possibles (non demandées)
- Stockage local (localStorage) pour persister l'ajout
- Pagination ou lazy-loading des todos
- Gestion erreurs raffinée (retry, état hors-ligne)
- Tests unitaires (Jest) côté logique pure (helpers)
- Composants web (Web Components) pour factoriser cartes / todos

## 👨‍💻 Auteurs
Projet réalisé dans le cadre d'une épreuve académique (E1). Libre d'adaptation.

---
Bon courage et bonne soutenance !
