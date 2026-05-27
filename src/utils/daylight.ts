import { differenceInMinutes, parseISO } from 'date-fns'

export interface AstronomicalEvent {
  date: string
  label: string
  type: 'solstice' | 'equinox'
}

export function getSolsticesAndEquinoxes(year: number): AstronomicalEvent[] {
  return [
    { date: `${year}-03-20`, label: 'Mar Eq', type: 'equinox' },
    { date: `${year}-06-21`, label: 'Jun Sol', type: 'solstice' },
    { date: `${year}-09-22`, label: 'Sep Eq', type: 'equinox' },
    { date: `${year}-12-21`, label: 'Dec Sol', type: 'solstice' },
  ]
}

export function calcDurationMinutes(sunrise: string, sunset: string): number {
  return differenceInMinutes(parseISO(sunset), parseISO(sunrise))
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function formatDelta(deltaMinutes: number): string {
  if (deltaMinutes === 0) return 'Same as yesterday'
  const sign = deltaMinutes > 0 ? '+' : ''
  return `${sign}${deltaMinutes} min vs yesterday`
}

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100
}
