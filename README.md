# OpenSlides Manager

Open source web toolbox for presentations and images. Light/dark theme, remove.bg-inspired: simple, clean UI, smooth animations, SaaS feel.

Repo: https://github.com/SimplementJohn/OpenSlides-Manager

<!-- Dynamic badges (shields.io) -->
![Stars](https://img.shields.io/github/stars/SimplementJohn/OpenSlides-Manager?style=flat&logo=github)
![Forks](https://img.shields.io/github/forks/SimplementJohn/OpenSlides-Manager?style=flat&logo=github)
![Watchers](https://img.shields.io/github/watchers/SimplementJohn/OpenSlides-Manager?style=flat&logo=github)
![Issues](https://img.shields.io/github/issues/SimplementJohn/OpenSlides-Manager)
![Pull Requests](https://img.shields.io/github/issues-pr/SimplementJohn/OpenSlides-Manager)
![Last commit](https://img.shields.io/github/last-commit/SimplementJohn/OpenSlides-Manager)
![Commit activity](https://img.shields.io/github/commit-activity/m/SimplementJohn/OpenSlides-Manager)
![Contributors](https://img.shields.io/github/contributors/SimplementJohn/OpenSlides-Manager)
![Release](https://img.shields.io/github/v/release/SimplementJohn/OpenSlides-Manager?include_prereleases&sort=semver)
![Repo size](https://img.shields.io/github/repo-size/SimplementJohn/OpenSlides-Manager)
![Languages](https://img.shields.io/github/languages/top/SimplementJohn/OpenSlides-Manager)
![License](https://img.shields.io/github/license/SimplementJohn/OpenSlides-Manager)

## Features

- **Marketing site** — home page, tools page, slide editor (mockup), live GitHub stats page. Free, open source, no account required.
- **Background removal** (`/bgremover`) — remove an image background, 100% in the browser (`@imgly/background-removal`), free, private, no API key. Live progress bar.
- **Slides Loading** (`/loadingslides`) — drop a thin/long image, pick a slide count, generate a ZIP of PNGs where a loading bar fills up progressively, slide by slide. Play/scrub preview.
- **Arrange slides** (`/arrange`) — reorder, duplicate and delete slides (images or PDF pages) via drag & drop, then export the reordered deck as a ZIP.
- **Auth** — secure local accounts (sign up / log in / log out), protected `/account` page.
- **Bilingual** UI (FR/EN, defaults to browser language) and **dark mode** (defaults to system preference).
- **Global drag & drop** of an image anywhere on the site.

The UI is bilingual; everything else in the repo (code, docs, issues, commits) is in **English**.

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [React Router](https://reactrouter.com/)
- [lucide-react](https://lucide.dev/) (icons)
- [jszip](https://stuk.github.io/jszip/) + [file-saver](https://github.com/eligrey/FileSaver.js) (ZIP export)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) (PDF page rendering)
- [@imgly/background-removal](https://github.com/imgly/background-removal-js) (local background removal, ONNX/WASM)
- **Backend**: [Express](https://expressjs.com/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), helmet, cors, cookie-parser, express-rate-limit, dotenv

All file/image processing runs client-side (Canvas / WASM). The backend only handles local authentication — no image upload to the server.

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/SimplementJohn/OpenSlides-Manager.git
cd OpenSlides-Manager
npm install
cp .env.example .env   # fill in JWT_SECRET
npm run dev:all        # frontend (5173) + API (4000)
```

Open http://localhost:5173

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Authentication

Secure local auth: sign up / log in / log out, bcrypt-hashed passwords, session via **httpOnly JWT cookie**,
protected `/account` route, brute-force rate limiting.
See the API routes and security rules in [CLAUDE.md](CLAUDE.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Frontend + API together |
| `npm run dev` | Frontend only (HMR) |
| `npm run server:dev` | API only (nodemon) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Structure

```
src/
  App.jsx              # home page (hero, features, carousel, CTA)
  main.jsx             # router + providers
  index.css            # design system (light + dark tokens)
  Drop.jsx             # shared image upload (drag / click / paste)
  i18n.jsx             # FR / EN i18n
  auth.jsx             # auth context (cookie session)
  lib/github.js        # memoized GitHub API access
  components/          # Navbar, Footer, Logo, LangToggle, ThemeToggle, Dropzone,
                       # Carousel, TemplateCard, GithubPanel, ProtectedRoute, BeforeAfter, SlidesPreview
  data/templates.js    # showcase template data
  pages/               # Templates(=Tools), Editor, GithubPage, Login, Account,
                       # BgRemover, LoadingSlides, Arrange
server/                # Express backend (auth) — see CLAUDE.md
```

## License

MIT — see [LICENSE](LICENSE).
