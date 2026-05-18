import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { calcDurationMinutes } from '@/utils/daylight'
import type { Coordinates, DaylightToday } from '@/types'

const BASE = 'https://api.open-meteo.com/v1/forecast'

interface ForecastResponse {
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
  }
}

async function fetchDaylightToday(coords: Coordinates): Promise<DaylightToday> {
  const { data } = await axios.get<ForecastResponse>(BASE, {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,
      daily: ['sunrise', 'sunset'],
      timezone: 'auto',
      past_days: 1,
      forecast_days: 1,
    },
  })

  const yesterdaySunrise = data.daily.sunrise[0]
  const yesterdaySunset = data.daily.sunset[0]
  const todaySunrise = data.daily.sunrise[1]
  const todaySunset = data.daily.sunset[1]
  const todayDate = data.daily.time[1]

  if (!todaySunrise || !todaySunset || !yesterdaySunrise || !yesterdaySunset || !todayDate) {
    throw new Error('Incomplete daylight data received from API')
  }

  const todayDuration = calcDurationMinutes(todaySunrise, todaySunset)
  const yesterdayDuration = calcDurationMinutes(yesterdaySunrise, yesterdaySunset)

  return {
    date: todayDate,
    sunrise: todaySunrise,
    sunset: todaySunset,
    durationMinutes: todayDuration,
    deltaMinutes: todayDuration - yesterdayDuration,
  }
}

export function useDaylightToday(coords: Coordinates | null) {
  return useQuery({
    queryKey: ['daylight-today', coords?.lat, coords?.lon],
    queryFn: () => fetchDaylightToday(coords!),
    enabled: coords !== null,
    staleTime: 10 * 60 * 1000,
  })
}
