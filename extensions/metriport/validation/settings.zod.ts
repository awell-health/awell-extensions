import { z } from 'zod'
import { rateLimitDurationSchema } from '../settings'

export const settingsSchema = z.object({
  baseUrl: z
    .string({ errorMap: () => ({ message: 'Missing baseUrl' }) })
    .min(1)
    .optional(),
  apiKey: z.string({ errorMap: () => ({ message: 'Missing apiKey' }) }).min(1),
  rateLimitDuration: rateLimitDurationSchema.optional(),
})
