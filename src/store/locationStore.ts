import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Location } from '@/types'

interface LocationState {
  location: Location | null
  setLocation: (location: Location) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
      clearLocation: () => set({ location: null }),
    }),
    { name: 'daylight-location' }
  )
)
