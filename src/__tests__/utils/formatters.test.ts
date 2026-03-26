import { describe, it, expect } from 'vitest'
import { formatNum, getGuid } from '@/utils/formatters'

describe('formatNum', () => {
  it('formats small numbers with 2 decimal places', () => {
    expect(formatNum(1.234)).toBe('1.23')
    expect(formatNum(-5.678)).toBe('-5.68')
    expect(formatNum(0)).toBe('0.00')
  })

  it('formats tens with 1 decimal place', () => {
    expect(formatNum(12.345)).toBe('12.3')
    expect(formatNum(-99.99)).toBe('-100.0')
  })

  it('formats hundreds with 0 decimal places', () => {
    expect(formatNum(123.456)).toBe('123')
    expect(formatNum(999)).toBe('999')
  })

  it('formats thousands with k suffix', () => {
    expect(formatNum(1500)).toBe('1.5k')
    expect(formatNum(9999)).toBe('10.0k')
  })

  it('formats ten-thousands with k suffix', () => {
    expect(formatNum(50000)).toBe('50k')
    expect(formatNum(999999)).toBe('1000k')
  })

  it('formats millions with M suffix', () => {
    expect(formatNum(1500000)).toBe('1.5M')
    expect(formatNum(9999999)).toBe('10.0M')
  })

  it('formats ten-millions with M suffix', () => {
    expect(formatNum(50000000)).toBe('50M')
  })

  it('accepts string input', () => {
    expect(formatNum('3.14')).toBe('3.14')
    expect(formatNum('1500')).toBe('1.5k')
  })
})

describe('getGuid', () => {
  it('returns a valid UUID v4 format', () => {
    const guid = getGuid()
    expect(guid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('generates unique values', () => {
    const guids = new Set(Array.from({ length: 100 }, () => getGuid()))
    expect(guids.size).toBe(100)
  })
})
