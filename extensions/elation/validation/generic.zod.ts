import { z } from 'zod'
import { formatISO } from 'date-fns'

/**
 * numberId is a REQUIRED field, so please use a z.coerce...optional() for non-
 * required numbers
 */
export const numberId = z.coerce
  .number({
    invalid_type_error: 'Requires a valid ID (number)',
  })
  .positive({
    message: 'Requires a valid ID (number)',
  })

export const stringDate = z.coerce
  .date({
    errorMap: () => ({
      message: 'Requires date in valid format (YYYY-MM-DD)',
    }),
  })
  .transform((arg) => formatISO(arg, { representation: 'date' }))

export const stringIsoDate = z.coerce
  .date({
    errorMap: () => ({
      message: 'Requires date in valid format (ISO8601)',
    }),
  })
  .transform((arg) => formatISO(arg))
