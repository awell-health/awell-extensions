import { DateTimeSchema } from '@awell-health/extensions-core'
import { z } from 'zod'

export const periodSchema = z.object({
  start: DateTimeSchema,
  end: DateTimeSchema.optional(),
})
