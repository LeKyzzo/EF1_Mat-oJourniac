ii .\projet-e1\index.html

# Portail E1 – mémo rapide

Je laisse ici tout ce qu'il faut pour lancer et vérifier l'appli sans se perdre.

## Démarrer en 30 secondes

1. Ouvrir le dossier `projet-e1` dans VS Code.
2. Lancer Live Server (ou équivalent) sur `index.html`.
3. Sinon, depuis PowerShell : `ii .\projet-e1\index.html` et rafraîchir si besoin.

## Ce que je vérifie toujours

- La liste d'accueil affiche bien les profils et le bouton "Voir plus" en charge davantage.
- La recherche réagit sur le nom, le pseudo, l'entreprise ou la ville.
- Le clic sur une carte m'emmène vers `user.html?id=...` avec toutes les infos.
- Ajouter une tâche la fait apparaître en haut et les filtres Todos restent cohérents.

## Structure éclair

```
projet-e1/
├── index.html
├── user.html
├── css/
├── js/
└── assets/
```

Tout est en HTML/CSS/JS vanilla, l'API vient de JSONPlaceholder.
