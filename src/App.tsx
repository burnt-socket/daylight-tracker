import { useEffect } from 'react'
import { useLocationStore } from '@/store/locationStore'
import { useThemeStore } from '@/store/themeStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useDaylightToday } from '@/hooks/useDaylightToday'
import { useDaylightYear } from '@/hooks/useDaylightYear'
import { reverseGeocode } from '@/utils/geocoding'
import { DaylightPanel } from '@/components/DaylightPanel'
import { DaylightChart } from '@/components/DaylightChart'
import { LocationSearch } from '@/components/LocationSearch'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function App() {
  const geo = useGeolocation()
  const { location, setLocation } = useLocationStore()
  const { theme } = useThemeStore()

  const coords = location ?? (geo.status === 'success' ? geo.coords : null)
  const { data: today, isLoading: todayLoading } = useDaylightToday(coords)
  const { data: yearData, isLoading: yearLoading } = useDaylightYear(coords)

  useEffect(() => {
    if (geo.status === 'success' && !location) {
      reverseGeocode(geo.coords.lat, geo.coords.lon).then(setLocation).catch(console.error)
    }
  }, [geo, location, setLocation])

  const isLocating = geo.status === 'loading' || geo.status === 'idle'

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-amber-50 transition-colors duration-300 dark:bg-slate-950">
        <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2.5">
            <AppIcon />
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Daylight
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LocationSearch onSelect={setLocation} />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-4 px-4 pb-12">
          <ErrorBoundary>
            {todayLoading || isLocating ? (
              <Skeleton className="h-52" />
            ) : today && location ? (
              <DaylightPanel data={today} location={location} />
            ) : geo.status === 'error' && !location ? (
              <div
                role="status"
                className="animate-fade-in rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/5"
              >
                <p className="font-medium text-gray-700 dark:text-slate-200">
                  Location unavailable
                </p>
                <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                  {geo.error} Search for a city above to get started.
                </p>
              </div>
            ) : null}
          </ErrorBoundary>

          <ErrorBoundary>
            {yearLoading ? (
              <Skeleton className="h-72" />
            ) : yearData ? (
              <DaylightChart data={yearData} />
            ) : null}
          </ErrorBoundary>
        </main>

        <footer className="mx-auto max-w-2xl px-4 pb-6 text-center text-xs text-gray-400 dark:text-slate-600">
          Built {new Date(__BUILD_DATE__).toISOString().slice(0, 10)}
        </footer>
      </div>
    </div>
  )
}

function AppIcon() {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}
