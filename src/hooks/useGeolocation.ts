import { useEffect, useState } from 'react'
import type { Coordinates } from '@/types'

type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: Coordinates }
  | { status: 'error'; error: string }

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

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

  return state
}
