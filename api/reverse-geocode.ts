export const config = { runtime: 'edge' }

interface NominatimResponse {
  address: {
    city?: string
    town?: string
    village?: string
    country?: string
  }
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
    return new Response('Missing or invalid lat/lon', { status: 400 })
  }

  const params = new URLSearchParams({ lat, lon, format: 'json' })
  const upstream = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { 'User-Agent': 'daylight-tracker/1.0' },
  })

  if (!upstream.ok) {
    return new Response('Geocoding upstream error', { status: upstream.status })
  }

  const data: NominatimResponse = await upstream.json()

  return Response.json(data, {
    headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate' },
  })
}
