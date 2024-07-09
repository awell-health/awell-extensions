import { formatISO, isValid, parse } from 'date-fns'
import { isNil } from 'lodash'

/**
 * Healthie seemingly uses a custom format for dates.
 * Their documentation platform does not explicitly say which format is used, but based
 * on testing we've identified 'yyyy-MM-dd HH:mm:ss XX' (example: `2023-06-05 14:10:00 +0200`)
 * as the format used. This has been tested in:
 * - appointment date
 *
 * This function can be used to convert from the format used by Healthie to the format expected
 * by orchestration (ISO8601).
 */
export const convertDate = (
  dateString: string | undefined | null,
  formatString: string = 'yyyy-MM-dd HH:mm:ss XX'
): string | undefined => {
  if (isNil(dateString)) {
    return undefined
  }
  const parsedDate = parse(dateString, formatString, new Date())
  if (isValid(parsedDate)) {
    return formatISO(parsedDate)
  }
  return undefined
}
