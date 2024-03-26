import { getNextDateWithinBusinessHours } from './getNextDateWithinBusinessHours' // Adjust the import path as necessary
import { setHours, startOfDay, addDays, formatISO } from 'date-fns'

describe('getNextDateWithinBusinessHours', () => {
  it('returns should throw an error when reference date is not a valid ISO8601 date', () => {
    const mockDateString = 'hello'

    expect(() => {
      getNextDateWithinBusinessHours(mockDateString)
    }).toThrowError()
  })

  it('returns the current date in ISO format if that date is within working hours', () => {
    const mockDate = setHours(startOfDay(new Date()), 10) // 10 AM is within working hours
    const mockDateString = formatISO(mockDate)

    expect(getNextDateWithinBusinessHours(mockDateString)).toEqual(
      formatISO(mockDate)
    )
  })

  it('returns the next day at 9 AM in ISO format when the date is after working hours', () => {
    const mockDate = setHours(startOfDay(new Date()), 18) // 6 PM is after working hours
    const mockDateString = formatISO(mockDate)
    const expectedDate = setHours(startOfDay(addDays(mockDate, 1)), 9)

    expect(getNextDateWithinBusinessHours(mockDateString)).toEqual(
      formatISO(expectedDate)
    )
  })

  it('returns today at 9 AM in ISO format when the date is before working hours', () => {
    const mockDate = setHours(startOfDay(new Date()), 8) // 8 AM is before working hours
    const mockDateString = formatISO(mockDate)
    const expectedDate = setHours(startOfDay(mockDate), 9) // Should return 9 AM of the same day

    expect(getNextDateWithinBusinessHours(mockDateString)).toEqual(
      formatISO(expectedDate)
    )
  })
})
