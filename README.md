# Daylight Tracker

Shows your location's sunrise, sunset, and daylight duration for today, plus a 12-month daylight curve (6 months past + 6 months forecast). Works offline after first load — installable as a PWA on mobile and desktop.

Live: https://daylight-tracker-pi.vercel.app

---

## Required tools

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org or `nvm` |
| npm | 10+ | bundled with Node.js |
| Git | any | `sudo apt install git` |
| GitHub CLI | any | `sudo apt install gh` |
| Vercel CLI | any | `npm i -g vercel` |

No API keys required. The app uses [Open-Meteo](https://open-meteo.com) (free, no auth) for weather data and proxies [Nominatim](https://nominatim.openstreetmap.org) reverse geocoding through a Vercel edge function so the public API is never called directly from users' browsers.

---

## External services

| Service | Purpose | Auth |
|---------|---------|------|
| [Open-Meteo](https://open-meteo.com) | Sunrise/sunset data, city search | None |
| [Nominatim](https://nominatim.openstreetmap.org) | Reverse geocoding (coords → city name) — called server-side only | None |
| [GitHub](https://github.com) | Source control, CI via GitHub Actions | SSH key or token |
| [Vercel](https://vercel.com) | Hosting, edge functions, production deploys | Account + project secrets |

Vercel secrets required in the GitHub repository (`Settings → Secrets → Actions`):

```
VERCEL_TOKEN       # from vercel.com → Account Settings → Tokens
VERCEL_ORG_ID      # from .vercel/project.json after first `vercel link`
VERCEL_PROJECT_ID  # from .vercel/project.json after first `vercel link`
```

---

## Local development

```bash
# Clone and install
git clone https://github.com/burnt-socket/daylight-tracker.git
cd daylight-tracker
npm install
```

### Dev server

There are two ways to run locally depending on what you're working on:

**Frontend only** (chart, panel, city search, theme):
```bash
npm run dev        # Vite dev server at http://localhost:5173
```

**Full stack including the reverse-geocode edge function** (needed when testing geolocation → city name):
```bash
vercel dev         # Runs Vite + edge functions together at http://localhost:3000
```

`vercel dev` requires a one-time `vercel link` to associate the local repo with your Vercel project.

### Available commands

```bash
npm run dev            # Vite dev server with hot reload (frontend only)
npm run build          # Type-check + production build → dist/
npm run preview        # Serve the production build locally
npm run lint           # ESLint (zero warnings required)
npm run typecheck      # tsc --noEmit
npm run test           # Vitest in watch mode
npm run test:ci        # Vitest single run (used in CI)
npm run test:coverage  # Coverage report (target: >80% on src/utils/)
```

Run this before every commit:

```bash
npm run lint && npm run typecheck && npm run test:ci
```

---

## Testing

Tests live alongside source files (e.g. `daylight.test.ts` next to `daylight.ts`).

### Run the suite

```bash
npm run test:ci        # single run, exit code 0 = all pass
npm run test           # watch mode — reruns on file save
npm run test:coverage  # generates coverage/index.html
```

### What is tested

| File | Tests | What they cover |
|------|-------|-----------------|
| `src/utils/daylight.test.ts` | 25 | `calcDurationMinutes`, `formatDuration`, `formatDelta`, `minutesToHours`, `getSolsticesAndEquinoxes` |

Tests use [Vitest](https://vitest.dev). No real API calls are made — the utility layer is pure functions with no network dependency.

### Coverage

```bash
npm run test:coverage
open coverage/index.html
```

The CI quality gate requires >80% statement coverage on `src/utils/`. Adding a new utility function without a test will fail CI.

### What is not tested yet

- Component smoke tests (`DaylightPanel`, `DaylightChart`) — these render Recharts which requires a DOM
- Hook tests (`useDaylightToday`, `useDaylightYear`) — need React Query + mocked `fetch`
- Edge function (`api/reverse-geocode.ts`) — requires a Vercel runtime mock or an integration test

---

## Publishing a new version

Deployment is fully automated via GitHub Actions. Every push to `main` triggers:

1. **CI** — lint, typecheck, tests
2. **Deploy Production** — Vercel build and deploy

```bash
# 1. Verify everything passes
npm run lint && npm run typecheck && npm run test:ci

# 2. Commit
git add <files>
git commit -m "feat|fix|chore: short description"

# 3. Push — triggers CI and production deploy automatically
git push origin main
```

Monitor the deploy:

```bash
gh run list --repo burnt-socket/daylight-tracker
gh run watch <run-id>
```

### Pull request flow

For larger changes, open a PR instead of pushing directly to `main`. A preview deploy is posted as a PR comment automatically.

```bash
git checkout -b feat/my-feature
# ... make changes ...
git push -u origin feat/my-feature
gh pr create --fill
```

Merging to `main` triggers production deploy.

---

## Project structure

```
api/
  reverse-geocode.ts        # Vercel edge function — proxies Nominatim, cached 24 h at CDN
public/
  icon.svg                  # SVG favicon
  icon-192.png              # PWA icon 192×192
  icon-512.png              # PWA icon 512×512
  icon-maskable-192.png     # Maskable PWA icon 192×192
  icon-maskable-512.png     # Maskable PWA icon 512×512
  apple-touch-icon.png      # iOS home screen icon 180×180
src/
  components/
    DaylightPanel/     # Today's sunrise/sunset card
    DaylightChart/     # 12-month area chart with solstice/equinox markers
    LocationSearch/    # City search with autocomplete
    ThemeToggle/       # Dark/light mode button
    ui/                # Skeleton, ErrorBoundary
  hooks/
    useGeolocation.ts      # Browser geolocation
    useDaylightToday.ts    # Today's data via React Query
    useDaylightYear.ts     # 12-month data via React Query
  store/
    locationStore.ts   # Zustand: coordinates + city name (persisted)
    themeStore.ts      # Zustand: dark/light preference (persisted)
  utils/
    daylight.ts        # Pure functions: duration, delta, formatting, astronomical events
    daylight.test.ts   # 25 unit tests
    geocoding.ts       # Open-Meteo city search + reverse geocoding via /api proxy
  types/index.ts
  App.tsx
  main.tsx
```

---

## PWA / Offline

After the first load, the app works fully offline — all static assets are precached by the Workbox service worker generated by `vite-plugin-pwa`. API responses are cached at the service worker layer with these TTLs:

| Endpoint | Strategy | TTL |
|----------|----------|-----|
| Open-Meteo forecast | NetworkFirst | 10 min |
| Open-Meteo archive | StaleWhileRevalidate | 1 hour |
| Open-Meteo geocoding | StaleWhileRevalidate | 24 hours |
| `/api/reverse-geocode` (edge) | StaleWhileRevalidate | 24 hours |

The edge function also sets `Cache-Control: s-maxage=86400` so Vercel's CDN serves repeated coordinate lookups without hitting Nominatim at all.

On Chrome/Edge the browser will offer an install prompt. On iOS, use **Share → Add to Home Screen**.
