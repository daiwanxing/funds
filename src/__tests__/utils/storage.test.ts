import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/utils/storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('stores and retrieves data', () => {
    storage.set({ darkMode: true })
    storage.get(['darkMode'], (res) => {
      expect(res.darkMode).toBe(true)
    })
  })

  it('stores multiple keys', () => {
    storage.set({ a: 1, b: 'hello', c: [1, 2, 3] })
    storage.get(['a', 'b', 'c'], (res) => {
      expect(res.a).toBe(1)
      expect(res.b).toBe('hello')
      expect(res.c).toEqual([1, 2, 3])
    })
  })

  it('returns empty object for missing keys', () => {
    storage.get(['nonexistent'], (res) => {
      expect(res).toEqual({})
    })
  })

  it('returns all data when keys is null', () => {
    storage.set({ x: 10, y: 20 })
    storage.get(null, (res) => {
      expect(res).toEqual({ x: 10, y: 20 })
    })
  })

  it('accepts string key shorthand', () => {
    storage.set({ singleKey: 'value' })
    storage.get('singleKey', (res) => {
      expect(res.singleKey).toBe('value')
    })
  })

  it('overwrites existing keys', () => {
    storage.set({ count: 1 })
    storage.set({ count: 2 })
    storage.get(['count'], (res) => {
      expect(res.count).toBe(2)
    })
  })

  it('calls callback after set', () => {
    let called = false
    storage.set({ test: true }, () => {
      called = true
    })
    expect(called).toBe(true)
  })
})
