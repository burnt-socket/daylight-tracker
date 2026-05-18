import { useState } from 'react'
import { searchCities } from '@/utils/geocoding'
import type { GeocodingResult, Location } from '@/types'

interface Props {
  onSelect: (location: Location) => void
}

export function LocationSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])

  async function handleChange(value: string) {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }
    try {
      const found = await searchCities(value)
      setResults(found)
    } catch {
      setResults([])
    }
  }

  function handleSelect(result: GeocodingResult) {
    onSelect({
      lat: result.latitude,
      lon: result.longitude,
      cityName: result.name,
      country: result.country,
    })
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => void handleChange(e.target.value)}
        placeholder="Search city…"
        aria-label="Search for a city"
        aria-haspopup="listbox"
        aria-expanded={results.length > 0}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      {results.length > 0 && (
        <ul
          role="listbox"
          aria-label="City suggestions"
          className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {results.map((result) => (
            <li key={result.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 dark:hover:bg-slate-700 dark:text-white"
              >
                {result.name}, {result.country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
