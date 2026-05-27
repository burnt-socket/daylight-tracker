import { describe, it, expect } from 'vitest'
import {
  calcDurationMinutes,
  formatDuration,
  formatDelta,
  minutesToHours,
  getSolsticesAndEquinoxes,
} from './daylight'

describe('calcDurationMinutes', () => {
  it('calculates duration for a normal summer day', () => {
    expect(calcDurationMinutes('2024-06-21T04:30', '2024-06-21T22:30')).toBe(1080)
  })

  it('calculates duration for a short winter day', () => {
    expect(calcDurationMinutes('2024-12-21T09:30', '2024-12-21T14:00')).toBe(270)
  })

  it('calculates duration for Dec 31', () => {
    expect(calcDurationMinutes('2024-12-31T08:45', '2024-12-31T15:15')).toBe(390)
  })

  it('handles near-midnight-sun extreme long day (~23h)', () => {
    expect(calcDurationMinutes('2024-06-21T00:30', '2024-06-21T23:30')).toBe(1380)
  })

  it('returns 0 for identical sunrise and sunset', () => {
    expect(calcDurationMinutes('2024-01-01T12:00', '2024-01-01T12:00')).toBe(0)
  })
})

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(462)).toBe('7h 42m')
  })

  it('formats exactly one hour', () => {
    expect(formatDuration(60)).toBe('1h 0m')
  })

  it('formats zero minutes', () => {
    expect(formatDuration(0)).toBe('0h 0m')
  })

  it('formats a long polar day', () => {
    expect(formatDuration(1380)).toBe('23h 0m')
  })

  it('formats a typical winter day', () => {
    expect(formatDuration(270)).toBe('4h 30m')
  })
})

describe('formatDelta', () => {
  it('formats a positive delta with sign', () => {
    expect(formatDelta(3)).toBe('+3 min vs yesterday')
  })

  it('formats a negative delta', () => {
    expect(formatDelta(-1)).toBe('-1 min vs yesterday')
  })

  it('returns special string for zero delta', () => {
    expect(formatDelta(0)).toBe('Same as yesterday')
  })

  it('formats large positive delta', () => {
    expect(formatDelta(15)).toBe('+15 min vs yesterday')
  })
})

describe('minutesToHours', () => {
  it('converts whole hours', () => {
    expect(minutesToHours(120)).toBe(2)
  })

  it('rounds to 2 decimal places', () => {
    expect(minutesToHours(90)).toBe(1.5)
  })

  it('handles a typical summer day duration', () => {
    expect(minutesToHours(1044)).toBe(17.4)
  })

  it('handles zero', () => {
    expect(minutesToHours(0)).toBe(0)
  })
})

describe('getSolsticesAndEquinoxes', () => {
  it('returns exactly 4 events per year', () => {
    expect(getSolsticesAndEquinoxes(2024)).toHaveLength(4)
  })

  it('returns 2 solstices and 2 equinoxes', () => {
    const events = getSolsticesAndEquinoxes(2024)
    expect(events.filter((e) => e.type === 'solstice')).toHaveLength(2)
    expect(events.filter((e) => e.type === 'equinox')).toHaveLength(2)
  })

  it('all dates belong to the requested year', () => {
    const events = getSolsticesAndEquinoxes(2025)
    events.forEach((e) => expect(e.date.startsWith('2025-')).toBe(true))
  })

  it('returns events in chronological order', () => {
    const events = getSolsticesAndEquinoxes(2024)
    const dates = events.map((e) => e.date)
    expect(dates).toEqual([...dates].sort())
  })

  it('summer solstice is in June', () => {
    const events = getSolsticesAndEquinoxes(2024)
    const junSol = events.find((e) => e.type === 'solstice' && e.date.includes('-06-'))
    expect(junSol).toBeDefined()
  })

  it('winter solstice is in December', () => {
    const events = getSolsticesAndEquinoxes(2024)
    const decSol = events.find((e) => e.type === 'solstice' && e.date.includes('-12-'))
    expect(decSol).toBeDefined()
  })

  it('each event has a non-empty label', () => {
    const events = getSolsticesAndEquinoxes(2024)
    events.forEach((e) => expect(e.label.length).toBeGreaterThan(0))
  })
})
