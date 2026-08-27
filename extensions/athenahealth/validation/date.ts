import { makeStringOptional } from '@awell-health/extensions-core'
import { format, isValid } from 'date-fns'
import { z } from 'zod'

/**
 * Athena expects dates MM/dd/yyyy
 */
export const AwellToAthenaDateOnlySchema = z.string().transform((arg, ctx) => {
  const date = new Date(arg)

  if (!isValid(date)) {
    ctx.addIssue({
      code: 'custom',
      message: 'No valid date',
      params: { reason: 'invalid_date', received: arg },
    })
    return z.NEVER
  }

  return format(date, 'MM/dd/yyyy')
})

export const AwellToAthenaDateOnlyOptionalSchema = makeStringOptional(
  AwellToAthenaDateOnlySchema,
)
