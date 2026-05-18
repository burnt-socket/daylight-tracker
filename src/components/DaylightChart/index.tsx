import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { minutesToHours } from '@/utils/daylight'
import type { DaylightDay } from '@/types'

interface Props {
  data: DaylightDay[]
}

export function DaylightChart({ data }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const chartData = data.map((d) => ({
    date: d.date,
    hours: minutesToHours(d.durationMinutes),
  }))

  return (
    <section
      aria-label="Daylight throughout the year"
      className="rounded-2xl bg-white/80 p-6 shadow-lg dark:bg-slate-900/80"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Daylight This Year
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="daylightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            interval={30}
            tickFormatter={(value: string) => {
              try {
                return format(parseISO(value), 'MMM')
              } catch {
                return ''
              }
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value: number) => `${value}h`}
          />
          <Tooltip
            formatter={(value: number) => [`${value}h`, 'Daylight']}
            labelFormatter={(label: string) => {
              try {
                return format(parseISO(label), 'MMM d')
              } catch {
                return label
              }
            }}
          />
          <ReferenceLine x={today} stroke="#6366f1" strokeDasharray="4 2" strokeWidth={2} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#f59e0b"
            fill="url(#daylightGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
