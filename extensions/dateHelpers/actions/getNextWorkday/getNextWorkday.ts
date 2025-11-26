import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const getNextWorkday: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getNextWorkday',
  title: 'Get Next Workday',
  description:
    'Get the next US Federal workday (Defaults to America/Chicago time zone)',
  category: Category.WORKFLOW,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const { referenceDate: referenceDateInput, includeReferenceDate } =
      FieldsValidationSchema.parse(payload.fields)

    const toZonedStartOfDay = (date: Date, tz: string): Date => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })
        .formatToParts(date)
        .reduce(
          (acc, part) => {
            if (part.type === 'year') acc.year = parseInt(part.value, 10)
            if (part.type === 'month') acc.month = parseInt(part.value, 10)
            if (part.type === 'day') acc.day = parseInt(part.value, 10)
            return acc
          },
          { year: 0, month: 0, day: 0 } as {
            year: number
            month: number
            day: number
          },
        )
      return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0))
    }

    // Use provided timezone if present, default from validation schema is America/Chicago
    const { timezone } = FieldsValidationSchema.parse(payload.fields)
    let referenceDate = toZonedStartOfDay(
      referenceDateInput ?? new Date(),
      timezone,
    )

    const SUNDAY = 0
    const SATURDAY = 6
    const isWeekend = (date: Date): boolean => {
      return date.getUTCDay() === SUNDAY || date.getUTCDay() === SATURDAY
    }
    const isHoliday = (date: Date): boolean => {
      const year = date.getUTCFullYear()

      const makeDateUTC = (y: number, mZero: number, d: number): Date =>
        new Date(Date.UTC(y, mZero, d, 0, 0, 0, 0))

      const isSameUTCDate = (a: Date, b: Date): boolean =>
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()

      const observedFixed = (y: number, mZero: number, d: number): Date => {
        const actual = makeDateUTC(y, mZero, d)
        const dow = actual.getUTCDay()
        if (dow === 0) {
          // Sunday -> observed Monday
          return makeDateUTC(y, mZero, d + 1)
        }
        if (dow === 6) {
          // Saturday -> observed Friday
          return makeDateUTC(y, mZero, d - 1)
        }
        return actual
      }

      const nthWeekdayOfMonth = (
        y: number,
        mZero: number,
        weekday: number,
        n: number,
      ): Date => {
        const firstOfMonth = makeDateUTC(y, mZero, 1)
        const firstDow = firstOfMonth.getUTCDay()
        const day = 1 + ((7 + weekday - firstDow) % 7) + (n - 1) * 7
        return makeDateUTC(y, mZero, day)
      }

      const lastWeekdayOfMonth = (
        y: number,
        mZero: number,
        weekday: number,
      ): Date => {
        const lastOfMonth = new Date(Date.UTC(y, mZero + 1, 0))
        const lastDow = lastOfMonth.getUTCDay()
        const day = lastOfMonth.getUTCDate() - ((7 + (lastDow - weekday)) % 7)
        return makeDateUTC(y, mZero, day)
      }

      // US Federal holidays (observed):
      const holidays: Date[] = []

      // New Year's Day (may be observed on Dec 31 of previous year)
      holidays.push(observedFixed(year, 0, 1))
      // Also include observed date for next year's New Year in case it falls on Dec 31 of this year
      holidays.push(observedFixed(year + 1, 0, 1))

      // Martin Luther King Jr. Day (3rd Monday of January)
      holidays.push(nthWeekdayOfMonth(year, 0, 1, 3))
      // Presidents' Day (3rd Monday of February)
      holidays.push(nthWeekdayOfMonth(year, 1, 1, 3))
      // Memorial Day (last Monday of May)
      holidays.push(lastWeekdayOfMonth(year, 4, 1))
      // Juneteenth (June 19, observed)
      holidays.push(observedFixed(year, 5, 19))
      // Independence Day (July 4, observed)
      holidays.push(observedFixed(year, 6, 4))
      // Labor Day (1st Monday of September)
      holidays.push(nthWeekdayOfMonth(year, 8, 1, 1))
      // Columbus Day / Indigenous Peoples' Day (2nd Monday of October)
      holidays.push(nthWeekdayOfMonth(year, 9, 1, 2))
      // Veterans Day (Nov 11, observed)
      holidays.push(observedFixed(year, 10, 11))
      // Thanksgiving (4th Thursday of November)
      holidays.push(nthWeekdayOfMonth(year, 10, 4, 4))
      // Christmas Eve (Dec 24, fixed - no observed rollover, only a holiday when it falls on a weekday)
      holidays.push(makeDateUTC(year, 11, 24))
      // Christmas Day (Dec 25, observed)
      holidays.push(observedFixed(year, 11, 25))

      return holidays.some((h) => isSameUTCDate(date, h))
    }

    const referenceDateIsWeekday = (referenceDate: Date): boolean =>
      !isWeekend(referenceDate) && !isHoliday(referenceDate)

    // If reference date is a weekday and we should *not* include it, move forward by one day (in timezone)
    const refIsWeekday = referenceDateIsWeekday(referenceDate)
    if (!includeReferenceDate && refIsWeekday) {
      referenceDate.setUTCDate(referenceDate.getUTCDate() + 1)
    }

    // If resultDate is a weekend, keep moving forward to the next weekday
    while (!referenceDateIsWeekday(referenceDate)) {
      referenceDate.setUTCDate(referenceDate.getUTCDate() + 1)
    }

    const nextWorkday = referenceDate.toISOString()

    await onComplete({
      data_points: {
        nextWorkday,
        referenceDateIsWeekday: String(refIsWeekday),
      },
    })
  },
}
