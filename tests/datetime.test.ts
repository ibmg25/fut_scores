import { describe, it, expect } from 'vitest'
import { toDatetimeLocal, datetimeLocalToUtcIso } from '@/lib/datetime/format'

// These tests are timezone-invariant: they check the millisecond value of the
// round-tripped date, not a hardcoded string, so they pass in any TZ.

describe('toDatetimeLocal', () => {
  it('produces YYYY-MM-DDTHH:mm format', () => {
    const result = toDatetimeLocal('2026-06-20T18:00:00.000Z')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('strips seconds and milliseconds', () => {
    const result = toDatetimeLocal('2026-06-20T18:45:30.123Z')
    expect(result).not.toContain(':30')
    expect(result).toMatch(/T\d{2}:45$/)
  })
})

describe('datetimeLocalToUtcIso', () => {
  it('produces a valid UTC ISO string', () => {
    const localStr = toDatetimeLocal('2026-06-20T18:00:00.000Z')
    const result = datetimeLocalToUtcIso(localStr)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})

describe('roundtrip: UTC → datetime-local → UTC', () => {
  const cases = [
    '2026-06-20T18:00:00.000Z',   // afternoon UTC
    '2026-07-01T00:00:00.000Z',   // midnight UTC (may shift calendar day in western TZs)
    '2026-06-21T23:30:00.000Z',   // late night UTC
    '2026-12-01T12:00:00.000Z',   // winter (DST off in most zones)
  ]

  for (const utcIso of cases) {
    it(`preserves the instant for ${utcIso}`, () => {
      const localStr = toDatetimeLocal(utcIso)
      const backToUtc = datetimeLocalToUtcIso(localStr)
      // datetime-local has minute precision — compare at that granularity
      const expected = new Date(utcIso)
      expected.setSeconds(0, 0)
      expect(new Date(backToUtc).getTime()).toBe(expected.getTime())
    })
  }
})
