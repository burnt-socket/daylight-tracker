import { useEffect, useState } from 'react'
import { useLocationStore } from '@/store/locationStore'
import type { Coordinates } from '@/types'

type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: Coordinates }
  | { status: 'error'; error: string }

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })
  const storedLocation = useLocationStore((s) => s.location)

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', error: 'Geolocation not supported by this browser' })
      return
    }
    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: 'success',
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        }),
      (err) => setState({ status: 'error', error: err.message })
    )
  }, [])

  // While the browser request is pending, surface last known coords so the UI isn't blank on revisit
  if ((state.status === 'idle' || state.status === 'loading') && storedLocation) {
    return { status: 'success', coords: { lat: storedLocation.lat, lon: storedLocation.lon } }
  }

  return state
}
