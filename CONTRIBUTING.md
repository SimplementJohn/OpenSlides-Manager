# Contributing to OpenSlides Manager

Thanks for your interest! Here's how to take part.

> All repo content — code, comments, docs, issues, PRs, commits — is written in **English**.

## Getting started

```bash
git clone https://github.com/SimplementJohn/OpenSlides-Manager.git
cd OpenSlides-Manager
npm install
cp .env.example .env   # fill in JWT_SECRET (only needed for the backend/auth)
npm run dev:all
```

Make sure the build passes before opening a PR:

```bash
npm run build
```

## Workflow

1. Fork the repo and create a branch off `main`:
   `git checkout -b feat/my-feature`
2. Make your changes (one topic per PR).
3. Ensure `npm run build` passes without errors.
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `style:` formatting / CSS with no logic change
   - `chore:` maintenance, deps, config
   - Subject ≤ 50 characters.
5. Push and open a Pull Request to `main` with a clear description.

## Product rules (read before adding a feature)

See [CLAUDE.md](CLAUDE.md) for the full guide. In short:

- **API-first & secure**: any server-side action goes through a clear, validated `/api` route (controllers → services), with proper error handling.
- **Bilingual**: every user-facing string lives in `src/i18n.jsx` (FR + EN). No hardcoded visible text.
- **Respect the theme**: reuse the design system (CSS variables, utility classes, shared components) — see the *Design system* section in CLAUDE.md.
- **Client-side file processing only** (Canvas / WASM). No image/PDF upload to the server.

## Adding a new tool

Follow an existing tool (`src/pages/BgRemover.jsx`, `Arrange.jsx`):

1. Create `src/pages/MyTool.jsx` using the page pattern (`container page` → `back-link` → `page-head` → `Drop`/dropzone → `card`s).
2. Add a lazy route in `src/main.jsx`.
3. Add an entry to the Tools page (`src/pages/Templates.jsx`) and FR/EN keys in `src/i18n.jsx`.

## Adding a showcase template

Add an object to `src/data/templates.js`. It automatically appears in the home carousel and the Tools page.

## Code style

- Functional React + hooks, no classes.
- Use CSS variables from `:root` / `html.dark` in `index.css` (`--accent`, `--surface`, `--text`…), never hardcoded hex.
- Icons via `lucide-react`, never emojis as structural icons.
- Image/file processing client-side only (Canvas / WASM), no server upload.
- Respect `prefers-reduced-motion` for any animation.

## Reporting a bug

Open an [issue](https://github.com/SimplementJohn/OpenSlides-Manager/issues) with:
- steps to reproduce,
- expected vs actual behavior,
- browser / OS,
- a screenshot if possible.
