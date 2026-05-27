import axios from 'axios'
import type { GeocodingResult, Location } from '@/types'

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1'

interface NominatimResponse {
  address: {
    city?: string
    town?: string
    village?: string
    country?: string
  }
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number
    name: string
    country: string
    latitude: number
    longitude: number
  }>
}

export async function reverseGeocode(lat: number, lon: number): Promise<Location> {
  const { data } = await axios.get<NominatimResponse>('/api/reverse-geocode', {
    params: { lat, lon },
  })
  return {
    lat,
    lon,
    cityName: data.address.city ?? data.address.town ?? data.address.village ?? 'Unknown',
    country: data.address.country ?? '',
  }
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  const { data } = await axios.get<OpenMeteoGeocodingResponse>(`${GEOCODING_BASE}/search`, {
    params: { name: query, count: 5, language: 'en', format: 'json' },
  })
  return data.results ?? []
}
