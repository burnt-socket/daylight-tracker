import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getYear } from 'date-fns'
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

async function fetchDaylightYear(coords: Coordinates): Promise<DaylightDay[]> {
  const year = getYear(new Date())
  const { data } = await axios.get<ArchiveResponse>(BASE, {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,
      daily: ['sunrise', 'sunset'],
      timezone: 'auto',
      start_date: `${year}-01-01`,
      end_date: `${year}-12-31`,
    },
  })

  return data.daily.time.map((date, i) => {
    const sunrise = data.daily.sunrise[i] ?? ''
    const sunset = data.daily.sunset[i] ?? ''
    return {
      date,
      sunrise,
      sunset,
      durationMinutes: sunrise && sunset ? calcDurationMinutes(sunrise, sunset) : 0,
    }
  })
}

export function useDaylightYear(coords: Coordinates | null) {
  return useQuery({
    queryKey: ['daylight-year', coords?.lat, coords?.lon],
    queryFn: () => fetchDaylightYear(coords!),
    enabled: coords !== null,
    staleTime: 60 * 60 * 1000,
  })
}
