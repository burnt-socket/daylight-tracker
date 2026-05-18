import { describe, it, expect } from 'vitest'
import { calcDurationMinutes, formatDuration, formatDelta, minutesToHours } from './daylight'

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
