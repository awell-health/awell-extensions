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
      code: z.ZodIssueCode.invalid_date,
      message: 'Not able to parse athena date',
    })
    return z.NEVER
  }

  return formatISO(date, { representation: 'date' })
})

export const AthenaDateOnlyOptionalSchema =
  makeStringOptional(AthenaDateOnlySchema)
