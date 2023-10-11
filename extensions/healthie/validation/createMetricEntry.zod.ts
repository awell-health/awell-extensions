import { z } from 'zod'

export const fieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  category: z.string().nonempty(),
  metricStat: z.number(),
})
