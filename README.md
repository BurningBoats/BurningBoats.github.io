# Burning Boats Studios — website

Official site of **Burning Boats Studios** (Mindaro). Static site built with [Astro](https://astro.build), Tailwind CSS v4, GSAP, Lenis and Three.js. Available in English (`/`), Spanish (`/es/`) and Portuguese (`/pt/`).

## Branches

| Branch | Purpose |
|---|---|
| `main` | Source code (this branch). Every push builds in GitHub Actions. |
| `new-pages` | **Published output** served by GitHub Pages. Never edit by hand — the workflow force-publishes `dist/` here. |
| `legacy/*` tags | Previous sites (`legacy/new-pages-jekyll`, `legacy/gh-pages-nextjs`, `legacy/development-nextjs`). |

Rollback the live site to the previous version: `git push origin legacy/new-pages-jekyll:new-pages --force` (and keep `AUTO_PUBLISH: "false"` in the workflow while it must stick).

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # astro check (types + content)
npm run build      # → dist/
npm run preview    # serve dist/
npm run budgets    # JS/CSS/asset size budgets (run after build)
npm run verify     # check + build + budgets + locale/SEO checklist (what CI runs)
```

QA helpers (need the installed Edge/Chrome, no browser download): `node scripts/screenshot.mjs --base=http://127.0.0.1:4321 --out=.cache/shots --paths=/,/mindaro/ [--full] [--mobile] [--theme=light] [--intro --delay=700]`. Lighthouse: `CHROME_PATH=<msedge.exe> npx lighthouse http://127.0.0.1:4322/ --output=json`.

Node ≥ 22.12 (`.nvmrc` = 24).

## Content

- UI strings & page copy: `src/i18n/{en,es,pt}.ts` (typed — a missing key fails `astro check`).
- Team: `src/content/team.json`. News: `src/content/news/{en,es,pt}/*.md`. Jobs: `src/content/jobs/{en,es,pt}/*.md`.
- Game facts, links and media slots (`youtubeId`, `heroLoop`): `src/data/mindaro.ts`. Studio links/legal: `src/config/site.ts`.

## Assets

Source assets live outside the repo (`H:\Burning Boats Studios`, never the `Videos` folder). `npm run assets:import` reads them and writes optimized masters into `src/assets/` and `public/`. Only the optimized outputs are committed — never raw originals.

## The ember accent (how to remove or recolor it)

- Recolor: change one line in `src/styles/tokens.css` → `--accent-ember`.
- Remove all fire/particle effects: `src/config/site.ts` → `SITE.effects.enabled = false`. Everything falls back to a finished navy/cream state.

## Claude Code skills (local, not committed)

`.claude/skills/` is git-ignored. It holds third-party skills copied from the local vault (`H:\ClaudeCodeVault\Repos\<repo>\.codigo\skills\<skill>`): `threejs-{fundamentals,shaders,postprocessing,animation,materials}` (CloudAI-X), `animate`, `animation-vocabulary`, `improve-animations`, `review-animations`, `find-animation-opportunities` (Emil Kowalski), `frontend-design`, `theme-factory` (Anthropic), `web-design-guidelines` (Vercel), `impeccable` (pbakaus — never run its live-server without `IMPECCABLE_LIVE_COPY_AGENT=off`), `performance-optimization`, `frontend-ui-engineering` (Addy Osmani).

## Publish

`.github/workflows/deploy.yml` builds on every push to `main`. Publishing to `new-pages` happens only when `AUTO_PUBLISH` is `"true"` (or via *Run workflow* with `publish: true`). Custom domain: set `SITE.customDomain` in `src/config/site.ts` **after** DNS is configured — the build then emits `CNAME`.
