import { format, parseISO } from 'date-fns'
import { formatDuration, formatDelta } from '@/utils/daylight'
import type { DaylightToday, Location } from '@/types'

interface Props {
  data: DaylightToday
  location: Location
}

export function DaylightPanel({ data, location }: Props) {
  return (
    <section
      aria-label="Today's daylight"
      className="rounded-2xl bg-white/80 p-6 shadow-lg dark:bg-slate-900/80"
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {location.cityName}, {location.country}
      </p>
      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
        {format(parseISO(data.date), 'EEEE, MMMM d yyyy')}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Stat label="Sunrise" value={data.sunrise.slice(11, 16)} />
        <Stat label="Sunset" value={data.sunset.slice(11, 16)} />
        <Stat label="Daylight" value={formatDuration(data.durationMinutes)} />
        <Stat label="vs Yesterday" value={formatDelta(data.deltaMinutes)} />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}
