import { z } from 'zod'
import { formatISO } from 'date-fns'

export const DateOnlySchema = z.coerce
  .date({
    errorMap: () => ({
      message: 'Requires date in valid format (YYYY-MM-DD)',
    }),
  })
  .transform((arg) => formatISO(arg, { representation: 'date' }))

export const DateTimeSchema = z.coerce
  .date({
    errorMap: () => ({
      message: 'Requires date in valid format (ISO8601)',
    }),
  })
  .transform((arg) => formatISO(arg))
