export interface Coordinates {
  lat: number
  lon: number
}

export interface Location extends Coordinates {
  cityName: string
  country: string
}

export interface DaylightDay {
  date: string
  sunrise: string
  sunset: string
  durationMinutes: number
}

export interface DaylightToday extends DaylightDay {
  deltaMinutes: number
}

export interface GeocodingResult {
  id: number
  name: string
  country: string
  latitude: number
  longitude: number
}

export type Theme = 'light' | 'dark'
