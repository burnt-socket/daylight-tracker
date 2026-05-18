# Daylight Tracker

Shows your location's sunrise, sunset, and daylight duration for today, plus a 12-month daylight curve (6 months past + 6 months forecast).

Live: https://daylight-tracker-pi.vercel.app

---

## Required tools

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org or `nvm` |
| npm | 10+ | bundled with Node.js |
| Git | any | `sudo apt install git` |
| GitHub CLI | any | `sudo apt install gh` |

No API keys required. The app uses [Open-Meteo](https://open-meteo.com) (free, no auth) and [Nominatim](https://nominatim.openstreetmap.org) (free, no auth).

---

## External services

| Service | Purpose | Auth |
|---------|---------|------|
| [Open-Meteo](https://open-meteo.com) | Sunrise/sunset data, geocoding | None |
| [Nominatim](https://nominatim.openstreetmap.org) | Reverse geocoding (coords → city name) | None |
| [GitHub](https://github.com) | Source control, CI via GitHub Actions | SSH key or token |
| [Vercel](https://vercel.com) | Hosting and production deploys | Account + project secrets |

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

# Start dev server (http://localhost:5173)
npm run dev
```

### Available commands

```bash
npm run dev          # Vite dev server with hot reload
npm run build        # Type-check + production build → dist/
npm run preview      # Serve the production build locally
npm run lint         # ESLint (zero warnings required)
npm run typecheck    # tsc --noEmit (no emit, just type checking)
npm run test         # Vitest in watch mode
npm run test:ci      # Vitest single run (used in CI)
npm run test:coverage  # Coverage report (must stay above 80%)
```

Run this before every commit:

```bash
npm run lint && npm run typecheck && npm run test:ci
```

---

## Publishing a new version

Deployment is fully automated via GitHub Actions. Every push to `main` triggers:

1. **CI** — lint, typecheck, tests
2. **Deploy Production** — Vercel build and deploy

To publish from the CLI:

```bash
# 1. Make your changes, then verify everything passes
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

### Pull request flow (optional)

For larger changes, open a PR instead of pushing directly to `main`. A preview deploy is posted as a PR comment automatically.

```bash
git checkout -b feat/my-feature
# ... make changes ...
git push -u origin feat/my-feature
gh pr create --fill
```

Merging the PR to `main` triggers production deploy.

---

## Project structure

```
src/
  components/
    DaylightPanel/     # Today's sunrise/sunset card
    DaylightChart/     # 12-month area chart
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
    daylight.ts        # Pure functions: duration, delta, formatting
    geocoding.ts       # Open-Meteo + Nominatim fetch helpers
  types/index.ts
  App.tsx
  main.tsx
```
