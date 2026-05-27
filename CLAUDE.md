# Daylight Tracker

## Project Overview
Build a modern React web app that shows users their location's daylight information:
current day's sunrise/sunset times, daylight duration, and a full-year daylight
curve visualized as a sine-like chart. Responsive, polished UI.

---

## Tech Stack
- React 19 + Vite
- TypeScript (strict mode)
- Tailwind CSS v4
- Recharts (daylight curve chart)
- React Query (data/state management)
- Zustand (global state)
- date-fns (date calculations)
- axios (HTTP client)
- vite-plugin-pwa + Workbox (PWA / offline support)
- Open-Meteo API (free, no key required)
- Nominatim (reverse geocoding, no key required)
- Vercel (deployment)

---

## Bootstrap / First-Time Setup

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install recharts @tanstack/react-query zustand date-fns axios
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin
npm install -D vite-plugin-pwa
```

After scaffolding, configure:
- `vite.config.ts` — add Tailwind plugin, VitePWA plugin, Vitest settings, and `define: { __BUILD_DATE__ }` for build stamping
- `tsconfig.json` — ensure `strict: true`, `noUncheckedIndexedAccess: true`
- `eslint.config.js` — use `@typescript-eslint/recommended` + `prettier`
- `.prettierrc` — `{ "semi": false, "singleQuote": true, "printWidth": 100 }`
- Tailwind v4 uses CSS-based configuration (`@import "tailwindcss"` in CSS) — no `tailwind.config.ts` file

---

## Development Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # TypeScript compile + Vite production build
npm run preview      # Preview production build locally
npm run lint         # ESLint (zero warnings required)
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (watch mode)
npm run test:ci      # Vitest (single run, for CI)
npm run test:coverage  # Vitest coverage report
```

Run before every commit: `npm run lint && npm run typecheck && npm run test:ci`

---

## Project Structure

```
src/
  components/
    DaylightPanel/       # Today's daylight card
    DaylightChart/       # Full-year area chart
    LocationSearch/      # City search input + suggestions
    ThemeToggle/         # Dark/light mode button
    ui/                  # Reusable primitives (Skeleton, ErrorBoundary, etc.)
  hooks/
    useGeolocation.ts    # Browser geolocation hook
    useDaylightToday.ts  # React Query hook for today's data
    useDaylightYear.ts   # React Query hook for 12-month data (6 months past + 6 months forecast)
  store/
    locationStore.ts     # Zustand: current coordinates + city name
    themeStore.ts        # Zustand: dark/light mode preference
  utils/
    daylight.ts          # Pure functions: duration calc, delta, formatting
    geocoding.ts         # Nominatim fetch helpers
  types/
    index.ts             # Shared TypeScript interfaces
  App.tsx
  main.tsx
```

---

## API Endpoints

### Open-Meteo — today's sunrise/sunset
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &daily=sunrise,sunset
  &timezone=auto
  &forecast_days=2
```
Returns today + tomorrow; use index 0 for today, compare index -1 from yesterday's call (or fetch `past_days=1`).

### Open-Meteo — 12-month chart data (two requests in parallel)

The archive API only serves historical data up to today — future dates return a 400 error.
Future months are proxied from the previous year's archive (day length is stable year-to-year),
with dates shifted forward by one year in the UI.

**Request 1 — past 6 months (real data):**
```
GET https://archive-api.open-meteo.com/v1/archive
  ?latitude={lat}&longitude={lon}
  &daily=sunrise,sunset
  &timezone=auto
  &start_date={today - 6 months}&end_date={today}
```

**Request 2 — future 6 months (proxied from last year):**
```
GET https://archive-api.open-meteo.com/v1/archive
  ?latitude={lat}&longitude={lon}
  &daily=sunrise,sunset
  &timezone=auto
  &start_date={tomorrow - 1 year}&end_date={today + 6 months - 1 year}
```
Dates from request 2 are shifted +1 year before display. Both requests run via `Promise.all`.

### Open-Meteo — geocoding (city search)
```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={query}&count=5&language=en&format=json
```

### Nominatim — reverse geocoding (coords → city name)
```
GET https://nominatim.openstreetmap.org/reverse
  ?lat={lat}&lon={lon}&format=json
```
Must send `User-Agent: daylight-tracker/1.0` header (set via `VITE_NOMINATIM_USER_AGENT`).

---

## App Features

### 1. Geolocation
- Request browser geolocation on load with graceful permission handling
- Show loading skeleton while fetching
- Fallback: manual city search using Open-Meteo geocoding API
- Reverse geocode coordinates to city/country name via Nominatim
- Store last known location in localStorage via Zustand persist middleware

### 2. Today's Daylight Panel
Display clearly:
- Location name (city, country)
- Current date
- Sunrise time (local timezone)
- Sunset time (local timezone)
- Total daylight duration (h m format, e.g. "17h 23m")
- Comparison to yesterday (+/- minutes, e.g. "+3 min vs yesterday")

### 3. 12-Month Daylight Curve
- Shows 6 months past (real archive data) + 6 months forecast (proxied from prior year)
- Two parallel archive requests; future dates shifted +1 year before display
- Compute daylight duration per day (sunset − sunrise in minutes)
- Render as smooth area chart (Recharts `AreaChart`) with:
  - X-axis: numeric month labels (1–12, no names)
  - Y-axis: hours of daylight
  - Tooltip: exact date + duration on hover
  - Vertical `ReferenceLine` at today (visually separates past from forecast)
  - Vertical `ReferenceLine` markers for solstices (orange, Jun 21 + Dec 21) and equinoxes (green, Mar 20 + Sep 22), labelled and filtered to the visible date range only
  - Gradient fill (warm/bright at top, fades to transparent)
- Shape resembles a sine curve peaking at summer solstice
- `getSolsticesAndEquinoxes(year)` in `src/utils/daylight.ts` returns fixed approximate dates; chart queries years currentYear-1/currentYear/currentYear+1 and filters to the visible range

### 4. Build Date Footer
- `vite.config.ts` injects `__BUILD_DATE__` as a compile-time string constant via Vite's `define`
- Declared in `vite-env.d.ts` as `declare const __BUILD_DATE__: string`
- Footer displays `Built YYYY-MM-DD HH:MM UTC` using the build timestamp, not runtime

### 5. PWA / Offline Support
- Implemented via `vite-plugin-pwa` (Workbox `generateSW` mode, `autoUpdate` register type)
- `manifest.webmanifest` is auto-generated with app name, icons, theme color, `display: standalone`
- Icons: `public/icon-192.png`, `public/icon-512.png`, maskable variants, `public/apple-touch-icon.png`, `public/icon.svg`
- Service worker precaches all static assets (JS, CSS, HTML, images) for full offline load
- Runtime caching strategies:
  - Open-Meteo forecast API → NetworkFirst, 10 min TTL
  - Open-Meteo archive API → StaleWhileRevalidate, 1 hr TTL
  - Open-Meteo geocoding API → StaleWhileRevalidate, 24 hr TTL
  - Nominatim reverse geocoding → StaleWhileRevalidate, 24 hr TTL
- `index.html` includes `<meta name="theme-color">` and `<link rel="apple-touch-icon">`
- Build requires Node.js 20+ (Workbox's terser minifier uses the global `crypto` API)

### 6. UI/UX Requirements
- Fully responsive (mobile-first, works on 320px+)
- Dark/light mode toggle, persisted to localStorage
- Smooth animations: fade-in on load, skeleton loaders while data fetches
- Light mode: warm sunrise oranges/yellows; dark mode: deep navy/indigo
- No UI component library — build custom components with Tailwind only
- Accessible: ARIA labels, keyboard navigation, WCAG AA color contrast

---

## State Management Patterns

- **Zustand** — persisted global state only: `{ lat, lon, cityName }` and `{ theme }`
- **React Query** — all async data fetching; cache today's data for 10 min, year data for 1 hour
- Keep component state local unless it needs to survive navigation or be shared

---

## Testing Guidelines

- Test all functions in `src/utils/` with Vitest unit tests (target >80% coverage)
- Key things to test: daylight duration calculation, delta formatting, date edge cases (Dec 31, leap years)
- Use `@testing-library/react` for component smoke tests on `DaylightPanel` and `DaylightChart`
- Mock `fetch` in tests — never hit real APIs in the test suite
- Test files live alongside source: `daylight.test.ts` next to `daylight.ts`

---

## Repository & CI/CD Setup

1. Initialize Git repo, push to GitHub
2. GitHub Actions workflows:
   - `ci.yml`: on push/PR → lint, typecheck, test:ci
   - `deploy-preview.yml`: on PR → deploy preview to Vercel, post URL as PR comment
   - `deploy-prod.yml`: on merge to main → deploy to Vercel production
3. `vercel.json`: set `buildCommand`, `outputDirectory: dist`, `framework: vite`
4. Branch protection on `main`: require CI pass + 1 PR review before merge
5. Conventional commit messages: `feat/fix/chore/ci/test/refactor`

---

## Automated Workflow Requirements

Claude Code should:
1. Create feature branches per major feature (e.g. `feat/geolocation`, `feat/chart`)
2. Make atomic commits with conventional messages after each logical unit
3. Run `npm run lint && npm run typecheck && npm run test:ci` before every commit — fix all errors first
4. Open PRs automatically when a feature branch is ready
5. PR description should summarize changes and link related issues

---

## Recommended Additional Features (implement after core)
- **Share button**: `/?lat=60.17&lon=24.93` URL encoding
- **Notifications**: optional browser notification at sunrise/sunset
- **Multi-location compare**: pin up to 3 locations, overlay curves
- **Stats panel**: longest/shortest day, days until next solstice

---

## Quality Gates (must pass before merging)
- Zero TypeScript errors (`tsc --noEmit` clean)
- ESLint: zero warnings
- Vitest coverage >80% on `src/utils/`
- Lighthouse: Performance >90, Accessibility >95
- Works offline after first load (PWA cache)

---

## Environment Variables

Add to Vercel and `.env.example`:
```
VITE_APP_NAME=DaylightTracker
VITE_NOMINATIM_USER_AGENT=daylight-tracker/1.0
```

---

## Package Management
- Always use `apt` or `apt-get` for installing packages
- Prefer `apt` over other package managers unless the project explicitly requires otherwise
- Use `snap` only as a last resort, if `apt` is not available
- If `apt` installation fails because a sudo password is required, stop and show the user the exact command(s) to run manually, then wait for confirmation before continuing