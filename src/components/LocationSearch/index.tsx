import { useState, useRef, useId } from 'react'
import { searchCities } from '@/utils/geocoding'
import type { GeocodingResult, Location } from '@/types'

interface Props {
  onSelect: (location: Location) => void
}

export function LocationSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  async function handleChange(value: string) {
    setQuery(value)
    setActiveIndex(-1)
    if (value.length < 2) {
      setResults([])
      return
    }
    setIsLoading(true)
    try {
      const found = await searchCities(value)
      setResults(found)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
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
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length && e.key !== 'Escape') return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          const selected = results[activeIndex]
          if (selected) handleSelect(selected)
        }
        break
      case 'Escape':
        setResults([])
        setActiveIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const activeOptionId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => void handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setResults([])
            setActiveIndex(-1)
          }}
          placeholder="Search city..."
          aria-label="Search for a city"
          aria-haspopup="listbox"
          aria-expanded={results.length > 0}
          aria-controls={results.length > 0 ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-busy={isLoading}
          autoComplete="off"
          className="w-44 rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-7 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
        />
        {isLoading ? (
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <svg
              className="h-3.5 w-3.5 animate-spin text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        ) : (
          <span
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600"
            aria-hidden="true"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        )}
      </div>

      {results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute right-0 z-10 mt-1 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {results.map((result, index) => (
            <li
              key={result.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                index === activeIndex
                  ? 'bg-amber-50 dark:bg-slate-700'
                  : 'hover:bg-amber-50 dark:hover:bg-slate-700'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(result)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="font-medium text-gray-900 dark:text-white">{result.name}</span>
              <span className="ml-1.5 text-gray-400 dark:text-slate-400">{result.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
