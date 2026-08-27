import { makeStringOptional } from '@awell-health/extensions-core'
import { formatISO, isValid } from 'date-fns'
import { z } from 'zod'

/**
 * Athena dates are in MM/DD/YYYY
 * We transform it to ISO date format
 */
export const AthenaDateOnlySchema = z.string().transform((arg, ctx) => {
  const date = new Date(arg)

  if (!isValid(date)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Not able to parse athena date',
      params: {
        reason: 'invalid_date',
        received: arg,
        expectedFormat: 'MM/DD/YYYY',
      },
    })
    return z.NEVER
  }

  return formatISO(date, { representation: 'date' })
})

export const AthenaDateOnlyOptionalSchema =
  makeStringOptional(AthenaDateOnlySchema)
