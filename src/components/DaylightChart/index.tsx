import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { minutesToHours, getSolsticesAndEquinoxes } from '@/utils/daylight'
import { useThemeStore } from '@/store/themeStore'
import type { DaylightDay } from '@/types'

interface Props {
  data: DaylightDay[]
}

export function DaylightChart({ data }: Props) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const today = format(new Date(), 'yyyy-MM-dd')

  const currentYear = new Date().getFullYear()
  const visibleEvents =
    data.length > 0
      ? [
          ...getSolsticesAndEquinoxes(currentYear - 1),
          ...getSolsticesAndEquinoxes(currentYear),
          ...getSolsticesAndEquinoxes(currentYear + 1),
        ].filter((e) => e.date >= data[0]!.date && e.date <= data[data.length - 1]!.date)
      : []

  const chartData = data.map((d) => ({
    date: d.date,
    hours: minutesToHours(d.durationMinutes),
  }))

  const axisColor = isDark ? '#475569' : '#9ca3af'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e5e7eb'
  const tooltipText = isDark ? '#e2e8f0' : '#374151'

  return (
    <section
      aria-label="Daylight hours throughout the year"
      className="animate-fade-in rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/5"
    >
      <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
        Daylight This Year
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="daylightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={isDark ? 0.45 : 0.7} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: axisColor }}
            interval={30}
            tickFormatter={(value: string) => {
              try {
                return format(parseISO(value), 'M')
              } catch {
                return ''
              }
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: axisColor }}
            tickFormatter={(value: number) => `${value}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              color: tooltipText,
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            itemStyle={{ color: tooltipText }}
            formatter={(value: number) => [`${value}h`, 'Daylight']}
            labelFormatter={(label: string) => {
              try {
                return format(parseISO(label), 'MMM d')
              } catch {
                return label
              }
            }}
          />
          {visibleEvents.map((event) => {
            const point = chartData.find((d) => d.date === event.date)
            if (!point) return null
            const month = parseInt(event.date.split('-')[1]!)
            const color = event.type === 'solstice' ? '#f97316' : '#10b981'
            const labelPosition = event.type === 'solstice' && month === 6 ? 'bottom' : 'top'
            return (
              <ReferenceDot
                key={event.date}
                x={event.date}
                y={point.hours}
                r={3}
                fill={color}
                stroke={isDark ? '#1e293b' : '#ffffff'}
                strokeWidth={1.5}
                label={{ value: event.label, position: labelPosition, fontSize: 8, fill: color }}
              />
            )
          })}
          <ReferenceLine
            x={today}
            stroke="#6366f1"
            strokeDasharray="4 2"
            strokeWidth={2}
            label={{ value: 'Today', position: 'insideTopRight', fontSize: 10, fill: '#6366f1' }}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#f59e0b"
            fill="url(#daylightGrad)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
