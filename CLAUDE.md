# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repo. **Keep this file updated after every important change.**
This file is **committed and public** (intentionally — no secrets here). It is the single source of truth for understanding the project, written to be easy for AI agents to parse.

> Language policy: the whole repository (code, comments, docs, issues, PRs, commits) is in **English**. Only the site UI is bilingual (FR/EN via i18n). The maintainer and the AI may chat in French, but nothing French ships to the repo.

## Project summary

OpenSlides Manager — **open source** web toolbox for presentations and images.
Frontend Vite + React 18 (light/dark theme, FR/EN i18n). File/image processing is 100% in-browser.
Minimal Express backend for **local authentication** (user accounts), with no payment or commercial system.

**Idea**: offer simple, private tools (background removal, loading slides, slide reordering, and upcoming PDF/PPTX conversion, watermark, pagination…) that run in the browser, free, with no server upload. See the **GitHub issues** for planned features.

Repo: https://github.com/SimplementJohn/OpenSlides-Manager
License: **MIT** (see [LICENSE](LICENSE)).

## Product rules (apply to EVERY new feature)

1. **API-first, secure and professional**: any server-side action goes through a clear `/api` route, validated (front + back), with clean error handling and the protections in place (see Security rules). No business logic in routes (controllers/services layers).
2. **Bilingual is mandatory**: every page/screen exists in **French AND English** via `src/i18n.jsx` (`t('...')` keys, never hardcoded visible text).
3. **Respect the theme**: reuse the design system (CSS variables, utility classes, shared components) — see *Design system*. No off-brand styles or hardcoded colors.
4. **Client-side file processing only** (Canvas / WASM) — no image/PDF upload to the server.
5. **Document here**: after adding something, update this file (structure, features, routes, deps) AND, for the public, the issues/README in **English**.
6. **Auto-commit big features**: whenever a significant new feature/change is completed and the build passes, commit it automatically (Conventional Commits, English message, link the issue with `Closes #N` when relevant). Do not auto-commit tiny/intermediate edits — only meaningful milestones.

## Design system (site theme)

- **Single file**: `src/index.css`. Tokens in `:root` (light) overridden under `html.dark` (dark, GitHub-like palette).
  Key tokens: `--bg`, `--surface`, `--surface-2`, `--line`, `--text`, `--muted`, `--muted-2`, `--accent (#6366f1)`, `--accent-d`, `--accent-soft`, `--card`, `--nav-bg`, `--radius`, `--radius-lg`, `--shadow*`.
- **Dark mode**: `dark` class on `<html>`, managed by `ThemeToggle` (defaults to system preference, choice stored in `localStorage`, anti-flash via inline script in `index.html`). Always use tokens so both themes work.
- **Fonts**: Manrope (headings `h1-h4`), Inter (body) — loaded via `<link>` in `index.html`.
- **Reusable utility classes**: `.container`, `.page`, `.page-head`, `.card`, `.btn` (+ `.btn-primary/.btn-ghost/.btn-lg/.btn-sm`), `.field`, `.dropzone`/`.dz-*`, `.tool-badge`, `.back-link`, `.reveal` (entrance animation), `.loader`, `.bg-frame`/`.bg-label`, `.section`.
- **Tool page pattern**: `<div className="container page">` → `back-link` → `page-head` (tool-badge + h1 + p) → `Drop`/dropzone → `.card`s. Mirror `BgRemover.jsx` / `Arrange.jsx`.
- **Shared components**: `Drop.jsx` (image upload: global drag + paste), `Navbar`, `Footer`, `Logo` (inline SVG), `LangToggle`, `ThemeToggle`, `ProtectedRoute`.
- **Required libraries**: icons **lucide-react** (never emoji as structural icons); ZIP **jszip** + **file-saver**; PDF rendering **pdfjs-dist**; background removal **@imgly/background-removal**. Reuse these before adding new ones.

## Stack

- **Frontend**: Vite 5, React 18, React Router 7, lucide-react (icons). Home-grown i18n (`src/i18n.jsx`).
- **Backend**: Node + Express, JWT (`jsonwebtoken`) in an httpOnly cookie, `bcryptjs` (hashing), `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `dotenv`.
- **Storage**: local JSON file (`server/data/users.json`, git-ignored), atomic writes. Swappable for SQLite/PG.
- **Image/file**: `@imgly/background-removal` (ONNX/WASM), `jszip`, `file-saver`, `pdfjs-dist` (PDF→images) — all client-side.

## Folder structure

```
src/                      # frontend
  main.jsx                # router + providers (Language, Auth)
  App.jsx                 # home page
  index.css               # design system (:root + html.dark tokens)
  i18n.jsx                # FR/EN dictionary + provider
  auth.jsx                # auth context (fetch /api/auth, cookie session)
  Drop.jsx                # shared image upload (global drag + paste)
  lib/github.js           # memoized GitHub API access (Navbar + GitHub page)
  components/             # Navbar, Footer, Logo, LangToggle, ThemeToggle, Dropzone,
                          # Carousel, TemplateCard, GithubPanel, ProtectedRoute, BeforeAfter, SlidesPreview
  pages/                  # Templates(=Tools), Editor, GithubPage, Login, Account,
                          # BgRemover, LoadingSlides, Arrange
  data/templates.js
server/                   # backend
  index.js                # bootstrap (listen)
  app.js                  # Express app + middlewares
  config.js               # config from .env
  routes/auth.js          # /api/auth routes (+ rate limit)
  controllers/authController.js
  services/authService.js # bcrypt hash/compare, user creation
  middleware/auth.js      # requireAuth (verifies the JWT cookie)
  middleware/errorHandler.js
  utils/store.js          # local JSON persistence
  utils/token.js          # JWT sign/verify + cookie options
  utils/validation.js     # register/login validation (also server-side)
  data/                   # users.json (generated, git-ignored)
.env.example              # env variables (no secrets)
```

## Commands

```bash
npm install            # dependencies
cp .env.example .env   # then fill in JWT_SECRET (cp/copy depending on OS)
npm run dev:all        # frontend (5173) + backend (4000) together
npm run dev            # frontend only
npm run server:dev     # backend only (nodemon)
npm run server         # backend prod (node)
npm run build          # frontend build -> dist/
npm run preview        # serve the build
```

The frontend dev server proxies `/api` to `http://localhost:4000` (see `vite.config.js`).
No tests/linter configured — validate with `npm run build` + manual API tests (curl).

## API routes

Base: `/api`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/api/health` | no | Server status. |
| POST | `/api/auth/register` | no | Create an account `{name,email,password}`. Sets the session cookie. → 201 `{user}`. |
| POST | `/api/auth/login` | no | Log in `{email,password}`. Sets the cookie. → 200 `{user}`. |
| POST | `/api/auth/logout` | no | Clears the session cookie. → `{ok:true}`. |
| GET  | `/api/auth/me` | **yes** | Returns the current user. → `{user}` or 401. |

Errors: `401` (unauthenticated / expired session / bad credentials), `409` (email already taken),
`422` (validation, with `fields`), `429` (rate limit), `500` (generic, no details leaked).
`/register` and `/login` are rate-limited (20 req / 15 min / IP).

## Implemented features

- Tools: **Background removal** (`/bgremover`), **Slides Loading** (`/loadingslides`), **Arrange slides** (`/arrange` — reorder/duplicate/delete images or PDF pages via drag & drop, ZIP export) — 100% client.
- Site: home, Tools page, editor (mockup), **GitHub** page (live stats via public API).
- FR/EN i18n (defaults to browser language), **dark mode** (defaults to system preference, anti-flash).
- Global image drag & drop across the whole site.
- **Local auth**: register, login, logout, session via httpOnly JWT cookie, protected `/account` route, `requireAuth` middleware, front + back validation, loaders, error messages.

## Remaining features (ideas)

- Password reset, email verification.
- Server-side user project storage (link tools to the account).
- Migrate the JSON store to SQLite + a repository layer.
- Automated tests (Vitest front, Supertest API), CI lint.
- Refresh tokens / rotation, session revocation.

See GitHub issues for the planned tool list (PDF↔PPTX, watermark, pagination, format conversion, presenter mode…).

## Security rules

- Passwords **hashed** with bcrypt (cost `BCRYPT_ROUNDS`, default 12) — never plaintext, never returned.
- JWT in an **httpOnly cookie** (`secure` in prod, `sameSite=lax`) — not readable by JS (anti-XSS).
- `JWT_SECRET` required in prod (explicit dev fallback only outside prod).
- Validation always on the **server** (the frontend is UX only).
- `helmet` (headers), `cors` restricted to `CORS_ORIGIN` with `credentials`, body capped at 100kb.
- Rate limiting on login/register (anti brute-force). bcrypt compare even when the user is absent (anti timing/enumeration).
- Generic server errors in prod (no stack/secret leaked). `server/data/` and `.env` are git-ignored.

## Code conventions

- Functional React + hooks. No classes.
- Colors via CSS variables (`:root` / `html.dark`), no hardcoded hex.
- Icons via `lucide-react`, never emoji as structural icons.
- Layered backend: routes → controllers → services → utils. No business logic in routes.
- Useful comments only (the "why", not the "what").
- Conventional Commits, subject ≤ 50 chars.
- **All repo content is written in English**: code, comments, commit messages, issue titles/bodies, pull requests, release notes, discussions, `.github/` templates, README/docs. The site UI stays bilingual via i18n.

## Environment variables

See `.env.example`. Keys: `PORT`, `NODE_ENV`, `JWT_SECRET` (≥32 chars, required in prod),
`JWT_EXPIRES_IN`, `COOKIE_NAME`, `CORS_ORIGIN`, `DATA_DIR`, `BCRYPT_ROUNDS`.

## Technical decisions

- **httpOnly cookie instead of a token in localStorage**: protects against XSS theft.
- **Local JSON store** instead of a DB: zero native dependency, ideal for a local open source project; abstracted in `utils/store.js` for easy migration.
- **bcryptjs** (pure JS) instead of native `bcrypt`: portable build (no compilation).
- **Vite `/api` proxy**: same origin in dev → simple cookies, no browser CORS.
- Auth deliberately minimal (no pricing/subscription) — non-commercial project.

## Performance

- React/router vendor isolated in a `react-vendor` chunk (`vite.config.js` manualChunks) → long-term caching; the app chunk drops from ~226KB to ~48KB.
- Heavy pages lazy-imported (BgRemover/imgly, LoadingSlides/jszip, Arrange/pdfjs, Editor, GitHub) — loaded on demand.
- Demo images as resized **WebP** (765KB PNG → ~69KB), `loading="lazy"` + `decoding="async"`. Favicon/og `icon-slides.png` reduced (176KB → 46KB).
- GitHub API calls memoized (`lib/github.js`) — no more duplicate Navbar/GithubPanel request.
- Google fonts loaded via `<link>` + `preconnect` (no blocking CSS `@import`).
- Inline SVG vector logo (`Logo.jsx`) + `icon-slides.svg` favicon (PNG as fallback / apple-touch / og).
- `lucide-react` up to date (1.17.0 = latest).

## Gotchas

- `@imgly/background-removal` downloads ~24MB of WASM/ONNX on first use; heavy build, expected.
- The carousel uses a CSS keyframe (`translateX -50%`) over a doubled list for the infinite loop.
- In prod, serve `dist/` behind the same domain as the API, or adjust `CORS_ORIGIN` + `secure` cookie (HTTPS required).
