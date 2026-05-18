import { differenceInMinutes, parseISO } from 'date-fns'

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
