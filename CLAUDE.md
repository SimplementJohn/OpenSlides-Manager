# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repo. **Keep this file updated after every important change.**

## Résumé du projet

OpenSlides Manager — boîte à outils web open source pour présentations et images.
Frontend Vite + React 18 (thème clair/sombre, i18n FR/EN). Traitement image 100% navigateur.
Backend Express minimal pour l'**authentification locale** (comptes utilisateurs), sans paiement ni système commercial.

Repo: https://github.com/SimplementJohn/OpenSlides-Manager

## Stack

- **Frontend**: Vite 5, React 18, React Router 7, lucide-react (icônes). i18n maison (`src/i18n.jsx`).
- **Backend**: Node + Express, JWT (`jsonwebtoken`) en cookie httpOnly, `bcryptjs` (hash), `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `dotenv`.
- **Stockage**: fichier JSON local (`server/data/users.json`, hors git), écritures atomiques. Remplaçable par SQLite/PG.
- **Image**: `@imgly/background-removal` (ONNX/WASM), `jszip`, `file-saver` — tout côté client.

## Structure des dossiers

```
src/                      # frontend
  main.jsx                # router + providers (Language, Auth)
  App.jsx                 # page d'accueil
  index.css               # design system (tokens :root + html.dark)
  i18n.jsx                # dictionnaire FR/EN + provider
  auth.jsx                # contexte auth (fetch /api/auth, cookie session)
  Drop.jsx                # zone upload image partagée (drag global + paste)
  components/             # Navbar, Footer, Logo, LangToggle, ThemeToggle,
                          # Dropzone, Carousel, TemplateCard, GithubPanel, ProtectedRoute
  pages/                  # Templates(=Outils), Editor, GithubPage, Login, Account,
                          # BgRemover, LoadingSlides
  data/templates.js
  lib/github.js           # accès API GitHub mémoïsé (Navbar + page GitHub)
server/                   # backend
  index.js                # bootstrap (listen)
  app.js                  # création app Express + middlewares
  config.js               # config depuis .env
  routes/auth.js          # routes /api/auth (+ rate limit)
  controllers/authController.js
  services/authService.js # bcrypt hash/compare, création user
  middleware/auth.js      # requireAuth (vérifie cookie JWT)
  middleware/errorHandler.js
  utils/store.js          # persistance JSON locale
  utils/token.js          # sign/verify JWT + options cookie
  utils/validation.js     # validation register/login (aussi côté serveur)
  data/                   # users.json (généré, gitignore)
.env.example              # variables d'env (sans secrets)
```

## Commandes

```bash
npm install            # dépendances
cp .env.example .env   # puis remplir JWT_SECRET (cp/copy selon OS)
npm run dev:all        # frontend (5173) + backend (4000) ensemble
npm run dev            # frontend seul
npm run server:dev     # backend seul (nodemon)
npm run server         # backend prod (node)
npm run build          # build frontend -> dist/
npm run preview        # sert le build
```

Le dev frontend proxy `/api` vers `http://localhost:4000` (voir `vite.config.js`).
Pas de tests/linter configurés — valider avec `npm run build` + tests manuels API (curl).

## Routes API

Base: `/api`

| Méthode | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/api/health` | non | Statut serveur. |
| POST | `/api/auth/register` | non | Crée un compte `{name,email,password}`. Pose le cookie session. → 201 `{user}`. |
| POST | `/api/auth/login` | non | Connexion `{email,password}`. Pose le cookie. → 200 `{user}`. |
| POST | `/api/auth/logout` | non | Efface le cookie session. → `{ok:true}`. |
| GET  | `/api/auth/me` | **oui** | Renvoie l'utilisateur courant. → `{user}` ou 401. |

Erreurs: `401` (non authentifié / session expirée / identifiants), `409` (email déjà pris),
`422` (validation, avec `fields`), `429` (rate limit), `500` (générique, sans détails).
`/register` et `/login` sont rate-limités (20 req / 15 min / IP).

## Fonctionnalités implémentées

- Outils image: **Détourage** (`/bgremover`), **Slides Loading** (`/loadingslides`) — 100% client.
- Site: accueil, page Outils, éditeur (maquette), page **GitHub** (stats live via API publique).
- i18n FR/EN (défaut = langue navigateur), **mode sombre** (défaut = préférence système, anti-flash).
- Drag & drop d'image global sur tout le site.
- **Auth locale**: inscription, connexion, déconnexion, session via cookie httpOnly JWT,
  route protégée `/account`, middleware `requireAuth`, validation front + back, loaders, messages d'erreur.

## Fonctionnalités restantes (idées)

- Réinitialisation de mot de passe, vérification email.
- Sauvegarde de projets utilisateur côté serveur (lier outils au compte).
- Migration du store JSON vers SQLite + couche repository.
- Tests automatisés (Vitest front, Supertest API), CI lint.
- Refresh tokens / rotation, révocation de session.

## Règles de sécurité

- Mots de passe **hashés** avec bcrypt (coût `BCRYPT_ROUNDS`, défaut 12) — jamais en clair, jamais renvoyés.
- JWT en **cookie httpOnly** (`secure` en prod, `sameSite=lax`) — non lisible par le JS (anti-XSS).
- `JWT_SECRET` obligatoire en prod (fallback dev explicite uniquement hors prod).
- Validation systématique côté **serveur** (le front ne fait que de l'UX).
- `helmet` (en-têtes), `cors` restreint à `CORS_ORIGIN` avec `credentials`, body limité à 100kb.
- Rate limiting sur login/register (anti brute-force). Comparaison bcrypt même si user absent (anti timing/enumeration).
- Erreurs serveur génériques en prod (pas de stack/secret exposé). `server/data/` et `.env` gitignore.

## Conventions de code

- React fonctionnel + hooks. Pas de classes.
- Couleurs via variables CSS (`:root` / `html.dark`), pas de hex en dur.
- Icônes `lucide-react`, jamais d'emoji structurel.
- Backend en couches: routes → controllers → services → utils. Pas de logique métier dans les routes.
- Commentaires utiles seulement (le « pourquoi », pas le « quoi »).
- Commits Conventional Commits, sujet ≤ 50 caractères.
- **Tout le contenu destiné à GitHub est rédigé en anglais**: messages de commit, titres/corps d'issues, pull requests, notes de release, discussions, templates `.github/`, et README/docs publics. (L'UI du site reste bilingue FR/EN via i18n ; les commentaires de code internes peuvent rester en FR.)

## Variables d'environnement

Voir `.env.example`. Clés: `PORT`, `NODE_ENV`, `JWT_SECRET` (≥32 chars, requis en prod),
`JWT_EXPIRES_IN`, `COOKIE_NAME`, `CORS_ORIGIN`, `DATA_DIR`, `BCRYPT_ROUNDS`.

## Décisions techniques

- **Cookie httpOnly plutôt que token en localStorage**: protège contre le vol par XSS.
- **Store JSON local** plutôt que DB: zéro dépendance native, idéal projet open source local; abstrait dans `utils/store.js` pour migration facile.
- **bcryptjs** (pur JS) plutôt que `bcrypt` natif: build portable (pas de compilation).
- **Proxy Vite `/api`**: même origine en dev → cookies simples, pas de CORS côté navigateur.
- Auth volontairement minimale (pas de pricing/abonnement) — projet non commercial.

## Performances

- Vendor React/router isolé dans un chunk `react-vendor` (`vite.config.js` manualChunks) → cache long terme; le chunk app passe de ~226KB à ~48KB.
- Pages lourdes en lazy import (BgRemover/imgly, LoadingSlides/jszip, Editor, GitHub) — chargées à la demande.
- Images demo en **WebP** redimensionnées (765KB PNG → ~69KB), `loading="lazy"` + `decoding="async"`. Favicon/og `icon-slides.png` réduit (176KB → 46KB).
- Appels API GitHub mémoïsés (`lib/github.js`) — plus de double requête Navbar/GithubPanel.
- Polices Google chargées via `<link>` + `preconnect` (plus d'`@import` CSS bloquant).
- Logo vectoriel SVG inline (`Logo.jsx`) + favicon `icon-slides.svg` (PNG en fallback / apple-touch / og).
- `LoadingSlides.jsx` nettoyé: système de modules retiré (~190 lignes mortes), garde une barre gauche→droite fixe.
- `lucide-react` à jour (1.17.0 = dernière).

## Gotchas

- `@imgly/background-removal` télécharge ~24MB de WASM/ONNX à la 1re utilisation; build lourd, normal.
- Le carousel utilise une keyframe CSS (`translateX -50%`) sur liste doublée pour la boucle infinie.
- En prod, servir `dist/` derrière le même domaine que l'API, ou ajuster `CORS_ORIGIN` + `secure` cookie (HTTPS requis).
