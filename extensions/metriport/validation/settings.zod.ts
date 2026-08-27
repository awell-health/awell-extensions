import { z } from 'zod'
import { DEFAULT_DEDUPE_DURATION, rateLimitDurationSchema } from '../settings'

export const settingsSchema = z.object({
  baseUrl: z
    .string({ error: 'Missing baseUrl' })
    .optional(),
  apiKey: z.string({ error: 'Missing apiKey' }).min(1),
  rateLimitDuration: rateLimitDurationSchema.optional().default(DEFAULT_DEDUPE_DURATION),
})
