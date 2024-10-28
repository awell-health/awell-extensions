import {
  getNextDateWithinBusinessHours,
  isDateBetweenBusinessHours,
} from './getNextDateWithinBusinessHours'
import { setHours, startOfDay, addDays } from 'date-fns'

describe('isDateBetweenBusinessHours', () => {
  describe('Default (UTC) timezone', () => {
    it('should return true for a date within business hours', () => {
      const date = new Date('2024-01-01T10:00:00Z')
      expect(isDateBetweenBusinessHours(date)).toBe(true)
    })

    it('should return false for a date before business hours', () => {
      const date = new Date('2024-01-01T08:59:00Z')
      expect(isDateBetweenBusinessHours(date)).toBe(false)
    })

    it('should return false for a date after business hours', () => {
      const date = new Date('2024-01-01T17:01:00Z')
      expect(isDateBetweenBusinessHours(date)).toBe(false)
    })

    it('should return true for a date exactly at the start of business hours', () => {
      const date = new Date('2024-01-01T09:00:00Z')
      expect(isDateBetweenBusinessHours(date)).toBe(true)
    })

    it('should return false for a date exactly at the end of business hours', () => {
      const date = new Date('2024-01-01T17:00:00Z')
      expect(isDateBetweenBusinessHours(date)).toBe(false)
    })
  })
  describe('"Europe/Brussels/ timezone', () => {
    const timeZone = 'Europe/Brussels'

    it('should return true for a date within business hours', () => {
      // 10 AM UTC is 11 AM Belgium time and is within business hours
      const date = new Date('2024-01-01T10:00:00Z')
      expect(isDateBetweenBusinessHours(date, timeZone)).toBe(true)
    })

    it('should return false for a date before business hours', () => {
      // 7 AM UTC is 8 AM Belgium time and is before business hours
      const date = new Date('2024-01-01T07:59:00Z')
      expect(isDateBetweenBusinessHours(date, timeZone)).toBe(false)
    })

    it('should return false for a date after business hours', () => {
      // 4 PM UTC is 5 PM Belgium time and is after business hours
      const date = new Date('2024-01-01T16:01:00Z')
      expect(isDateBetweenBusinessHours(date, timeZone)).toBe(false)
    })

    it('should return true for a date exactly at the start of business hours', () => {
      // 8 AM UTC is 9 PM Belgium time and is at the start of business hours
      const date = new Date('2024-01-01T08:00:00Z')
      expect(isDateBetweenBusinessHours(date, timeZone)).toBe(true)
    })

    it('should return false for a date exactly at the end of business hours', () => {
      // 4 PM UTC is 5 PM Belgium time and is at the end of business hours
      const date = new Date('2024-01-01T16:00:00Z')
      expect(isDateBetweenBusinessHours(date, timeZone)).toBe(false)
    })
  })
})

describe('getNextDateWithinBusinessHours', () => {
  describe('Default (UTC) timezone', () => {
    it('returns the current date in ISO format if that date is within working hours', () => {
      const mockDate = setHours(startOfDay(new Date()), 10) // 10 AM is within working hours

      expect(getNextDateWithinBusinessHours(mockDate)).toEqual(mockDate)
    })

    it('returns the next day at 9 AM in ISO format when the date is after working hours', () => {
      const mockDate = setHours(startOfDay(new Date()), 18) // 5 PM onwards is after working hours
      const expectedDate = setHours(startOfDay(addDays(mockDate, 1)), 9)

      expect(getNextDateWithinBusinessHours(mockDate)).toEqual(expectedDate)
    })

    it('returns today at 9 AM in ISO format when the date is before working hours', () => {
      const mockDate = setHours(startOfDay(new Date()), 8) // 8 AM is before working hours
      const expectedDate = setHours(startOfDay(mockDate), 9) // Should return 9 AM of the same day

      expect(getNextDateWithinBusinessHours(mockDate)).toEqual(expectedDate)
    })
  })

  describe('"Europe/Brussels" timezone', () => {
    const timeZone = 'Europe/Brussels'

    it('returns the current date in ISO format if that date is within working hours', () => {
      const mockDate = setHours(startOfDay(new Date()), 8) // 8 AM UTC is 9 AM in Belgium

      expect(getNextDateWithinBusinessHours(mockDate, timeZone)).toEqual(
        mockDate
      )
    })

    it('returns the next day at 9 AM in ISO format when the date is after working hours', () => {
      const mockDate = setHours(startOfDay(new Date('2024-10-01')), 16) // 4 PM UTC is 5 PM in Belgium and is after working hours
      const expectedDate = setHours(startOfDay(addDays(mockDate, 1)), 7) // should return 8 AM of the next day in UTC (which is 9 AM Belgium time)

      expect(getNextDateWithinBusinessHours(mockDate, timeZone)).toEqual(
        expectedDate
      )
    })

    it('returns today at 9 AM in ISO format when the date is before working hours', () => {
      const mockDate = setHours(startOfDay(new Date('2024-10-01')), 7) // 7 AM UTC is 8 AM in Belgum and is before working hours
      const expectedDate = setHours(startOfDay(mockDate), 7) // should return 8 AM of the same day in UTC (which is 9 AM Belgium time)

      expect(getNextDateWithinBusinessHours(mockDate, timeZone)).toEqual(
        expectedDate
      )
    })
  })
})
