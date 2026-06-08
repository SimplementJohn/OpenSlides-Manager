# Contribuer à OpenSlides Manager

Merci de ton intérêt ! Voici comment participer.

## Mise en route

```bash
git clone https://github.com/SimplementJohn/OpenSlides-Manager.git
cd OpenSlides-Manager
npm install
npm run dev
```

Vérifie qu'un build passe avant d'ouvrir une PR :

```bash
npm run build
```

## Workflow

1. Forke le repo et crée une branche depuis `main` :
   `git checkout -b feat/ma-fonctionnalite`
2. Fais tes changements (un sujet par PR).
3. Vérifie que `npm run build` passe sans erreur.
4. Commit en [Conventional Commits](https://www.conventionalcommits.org/) :
   - `feat:` nouvelle fonctionnalité
   - `fix:` correction de bug
   - `style:` mise en forme / CSS sans changement de logique
   - `chore:` maintenance, deps, config
   - Sujet ≤ 50 caractères.
5. Pousse et ouvre une Pull Request vers `main` avec une description claire.

## Ajouter un module à « Slides Loading »

Le rendu des diapos est piloté par des modules empilables dans `src/pages/LoadingSlides.jsx`.

1. Ajoute une entrée dans `MODULE_TYPES` (label, icône, valeurs par défaut).
2. Ajoute un cas dans `drawModule(ctx, m, i, n, W, H)` pour le dessin sur canvas.
3. Crée un composant éditeur (ex. `MonModuleEditor`) et branche-le dans le bloc « Réglages ».

## Ajouter un modèle vitrine

Ajoute un objet dans `src/data/templates.js`. Il apparaît automatiquement dans le carousel d'accueil et la page Modèles.

## Style de code

- React fonctionnel + hooks, pas de classes.
- Garde le thème clair : utilise les variables CSS de `:root` dans `index.css` (`--accent`, `--surface`, `--text`…), pas de hex en dur.
- Icônes via `lucide-react`, jamais d'emoji comme icône structurelle.
- Traitement image : côté client uniquement (Canvas / WASM), aucun upload serveur.
- Respecte `prefers-reduced-motion` pour toute animation.

## Signaler un bug

Ouvre une [issue](https://github.com/SimplementJohn/OpenSlides-Manager/issues) avec :
- étapes pour reproduire,
- comportement attendu vs constaté,
- navigateur / OS,
- capture si possible.
