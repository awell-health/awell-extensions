import { z } from 'zod'

export const settingsSchema = z.object({
  baseUrl: z
    .string({ errorMap: () => ({ message: 'Missing baseUrl' }) })
    .min(1)
    .optional(),
  apiKey: z.string({ errorMap: () => ({ message: 'Missing apiKey' }) }).min(1),
})
