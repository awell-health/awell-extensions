import { DateTimeSchema, NumericIdSchema } from '@awell-health/extensions-core'
import * as z from 'zod'

export const allergySchema = z
  .object({
    patient: NumericIdSchema,
    name: z.string(),
    start_date: DateTimeSchema.optional(),
    reaction: z.string().optional(),
    severity: z.string().optional(),
  })
  .strict()
