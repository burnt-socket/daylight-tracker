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
      <div className="min-h-screen bg-amber-50 transition-colors dark:bg-slate-950">
        <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Daylight Tracker</h1>
          <div className="flex items-center gap-2">
            <LocationSearch onSelect={setLocation} />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-6 px-4 pb-8">
          <ErrorBoundary>
            {todayLoading || isLocating ? (
              <Skeleton className="h-48" />
            ) : today && location ? (
              <DaylightPanel data={today} location={location} />
            ) : geo.status === 'error' && !location ? (
              <p className="rounded-2xl bg-white/80 p-6 text-sm text-gray-500 dark:bg-slate-900/80 dark:text-gray-400">
                Could not detect location. Search for a city above.
              </p>
            ) : null}
          </ErrorBoundary>

          <ErrorBoundary>
            {yearLoading ? (
              <Skeleton className="h-64" />
            ) : yearData ? (
              <DaylightChart data={yearData} />
            ) : null}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
