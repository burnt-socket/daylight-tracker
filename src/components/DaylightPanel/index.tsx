import type { ReactNode } from 'react'
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
      aria-label="Today's daylight information"
      className="animate-fade-in rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/5"
    >
      <header>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {location.cityName}
          {location.country ? (
            <span className="ml-2 text-sm font-normal text-gray-400 dark:text-slate-500">
              {location.country}
            </span>
          ) : null}
        </h2>
        <p className="mt-0.5 text-sm text-gray-400 dark:text-slate-500">
          {format(parseISO(data.date), 'EEEE, MMMM d, yyyy')}
        </p>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        <StatItem label="Sunrise" icon={<SunriseIcon />}>
          {format(parseISO(data.sunrise), 'HH:mm')}
        </StatItem>
        <StatItem label="Sunset" icon={<SunsetIcon />}>
          {format(parseISO(data.sunset), 'HH:mm')}
        </StatItem>
        <StatItem label="Duration" icon={<ClockIcon />} large>
          {formatDuration(data.durationMinutes)}
        </StatItem>
        <StatItem
          label="vs Yesterday"
          icon={<DeltaArrow delta={data.deltaMinutes} />}
          deltaColor={
            data.deltaMinutes > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : data.deltaMinutes < 0
                ? 'text-rose-500 dark:text-rose-400'
                : undefined
          }
        >
          {formatDelta(data.deltaMinutes)}
        </StatItem>
      </dl>
    </section>
  )
}

interface StatItemProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  large?: boolean
  deltaColor?: string
}

function StatItem({ label, icon, children, large = false, deltaColor }: StatItemProps) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-slate-500">
        {icon}
        {label}
      </dt>
      <dd
        className={`mt-1 font-semibold leading-tight ${large ? 'text-2xl' : 'text-lg'} ${deltaColor ?? 'text-gray-900 dark:text-white'}`}
      >
        {children}
      </dd>
    </div>
  )
}

function SunriseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
      <polyline points="8 6 12 2 16 6" />
    </svg>
  )
}

function SunsetIcon() {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#818cf8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="9" x2="12" y2="2" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
      <polyline points="16 5 12 9 8 5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function DeltaArrow({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    )
  }
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {delta > 0 ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  )
}
