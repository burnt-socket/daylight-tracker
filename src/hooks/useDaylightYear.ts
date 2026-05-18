import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format, addDays, subMonths, addMonths, subYears, addYears, parseISO } from 'date-fns'
import { calcDurationMinutes } from '@/utils/daylight'
import type { Coordinates, DaylightDay } from '@/types'

const BASE = 'https://archive-api.open-meteo.com/v1/archive'

interface ArchiveResponse {
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
  }
}

function toDaylightDays(data: ArchiveResponse, shiftYears = 0): DaylightDay[] {
  return data.daily.time.map((date, i) => {
    const sunrise = data.daily.sunrise[i] ?? ''
    const sunset = data.daily.sunset[i] ?? ''
    const displayDate =
      shiftYears !== 0 ? format(addYears(parseISO(date), shiftYears), 'yyyy-MM-dd') : date
    return {
      date: displayDate,
      sunrise,
      sunset,
      durationMinutes: sunrise && sunset ? calcDurationMinutes(sunrise, sunset) : 0,
    }
  })
}

async function fetchDaylightYear(coords: Coordinates): Promise<DaylightDay[]> {
  const today = new Date()
  const pastStart = format(subMonths(today, 6), 'yyyy-MM-dd')
  const todayStr = format(today, 'yyyy-MM-dd')
  // Future 6 months proxied from last year's archive (day length is stable year-to-year)
  const proxyStart = format(subYears(addDays(today, 1), 1), 'yyyy-MM-dd')
  const proxyEnd = format(subYears(addMonths(today, 6), 1), 'yyyy-MM-dd')

  const [pastRes, futureRes] = await Promise.all([
    axios.get<ArchiveResponse>(BASE, {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        daily: ['sunrise', 'sunset'],
        timezone: 'auto',
        start_date: pastStart,
        end_date: todayStr,
      },
    }),
    axios.get<ArchiveResponse>(BASE, {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        daily: ['sunrise', 'sunset'],
        timezone: 'auto',
        start_date: proxyStart,
        end_date: proxyEnd,
      },
    }),
  ])

  return [...toDaylightDays(pastRes.data), ...toDaylightDays(futureRes.data, 1)]
}

export function useDaylightYear(coords: Coordinates | null) {
  return useQuery({
    queryKey: ['daylight-year', coords?.lat, coords?.lon],
    queryFn: () => fetchDaylightYear(coords!),
    enabled: coords !== null,
    staleTime: 60 * 60 * 1000,
  })
}
