import { formatISO, addDays, startOfDay, setHours, isValid } from 'date-fns'

const START_HOUR_WORKING_DAY = 9 // 9 AM
const END_HOUR_WORKING_DAY = 17 // 5 PM

type ISOString = string

/**
 * Function doesn't take into account weekends.
 * Just checks that within any given day it's between 9 AM and 5 PM.
 * - If that's the case, return the reference date
 * - If not, return reference date + 1 day at 9 AM
 */
export const getNextDateWithinBusinessHours = (
  referenceDateAsISOString: ISOString
): ISOString => {
  const referenceDate = new Date(referenceDateAsISOString)

  if (!isValid(referenceDate)) {
    throw new Error('Reference date is not a valid date')
  }

  const hourOfReferenceDate = referenceDate.getHours()

  // If before 9 AM, return 9 AM of the same day
  if (hourOfReferenceDate < START_HOUR_WORKING_DAY) {
    return formatISO(
      setHours(startOfDay(referenceDate), START_HOUR_WORKING_DAY)
    )
  }
  // If after 5 PM, return 9 AM of the next day
  else if (hourOfReferenceDate >= END_HOUR_WORKING_DAY) {
    return formatISO(
      setHours(startOfDay(addDays(referenceDate, 1)), START_HOUR_WORKING_DAY)
    )
  }
  // If between 9 AM and 5 PM, return the reference date
  return formatISO(referenceDate)
}
