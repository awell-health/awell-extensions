import { z } from 'zod'
import { formatISO } from 'date-fns'
import { makeStringOptional } from '../generic'

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

export const DateOnlyOptionalSchema = makeStringOptional(DateOnlySchema)
export const DateTimeOptionalSchema = makeStringOptional(DateTimeSchema)
