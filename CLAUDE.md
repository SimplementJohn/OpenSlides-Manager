# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repo.

## Project

OpenSlides Manager — client-side web toolbox for presentations and images. Light theme, remove.bg-inspired SaaS look. Vite + React 18 + React Router. All image processing runs in the browser; no backend, no uploads.

Repo: https://github.com/SimplementJohn/OpenSlides-Manager

## Commands

- `npm run dev` — dev server with HMR (http://localhost:5173)
- `npm run build` — production build to `dist/` (use this to verify changes compile)
- `npm run preview` — serve the production build

There are no tests or linter configured. Validate work with `npm run build`.

## Architecture

- `src/main.jsx` — React Router setup. Two layouts: `Layout` (Navbar + Footer) for most pages, `Bare` (Navbar only) for `/login`. `ScrollTop` resets scroll on route change.
- `src/App.jsx` — home page (hero, dropzone, features, steps, auto-scroll carousel, CTA).
- `src/index.css` — single design system file. Light theme. Design tokens live in `:root` (`--accent #6366f1`, `--surface`, `--text`, radii, shadows). Utility classes: `.btn`, `.card`, `.container`, `.section`, `.reveal`, etc.
- `src/components/` — `Navbar`, `Footer`, `Logo`, `Dropzone` (home import), `Carousel`, `TemplateCard`.
- `src/data/templates.js` — showcase template data; consumed by carousel and Templates page.
- `src/pages/` — `Templates`, `Editor`, `Credits`, `Pricing`, `Login`, `Projects`, plus the two real tools: `BgRemover`, `LoadingSlides`.

### Real tools (functional, not mockups)

- **`pages/BgRemover.jsx`** (`/bgremover`) — background removal via `@imgly/background-removal`. Runs ONNX/WASM locally (~24MB model downloaded on first use). Outputs a transparent PNG, downloadable.
- **`pages/LoadingSlides.jsx`** (`/loadingslides`) — the original core feature. Takes one long/thin image, renders N slides where overlay modules fill progressively (`i/n`), zips PNGs via `jszip` + `file-saver`.
  - Stackable module system: `MODULE_TYPES` catalog + `drawModule(ctx, m, i, n, W, H)` canvas renderer + per-type editor components.
  - To add a module: add to `MODULE_TYPES`, add a case in `drawModule`, add an editor component.

The Editor / Credits / Pricing / Projects pages are UI mockups (no real backend logic).

## Conventions

- Functional React + hooks only.
- Use CSS variables from `:root`, not hardcoded hex, to stay on the light theme.
- Icons from `lucide-react`. No emoji as structural icons.
- Image work stays client-side (Canvas / WASM). Never add server uploads.
- Respect `prefers-reduced-motion` for animations.
- Commits: Conventional Commits, subject ≤ 50 chars.

## Gotchas

- `@imgly/background-removal` pulls large WASM/ONNX chunks; build is naturally heavy and slower. Expected.
- The carousel uses a CSS keyframe (`translateX -50%`) over a doubled list for an infinite loop; pauses on hover.
