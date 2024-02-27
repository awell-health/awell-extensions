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
      code: z.ZodIssueCode.invalid_date,
      message: 'No valid date',
    })
    return z.NEVER
  }

  return format(date, 'MM/dd/yyyy')
})

export const AwellToAthenaDateOnlyOptionalSchema = makeStringOptional(
  AwellToAthenaDateOnlySchema
)
