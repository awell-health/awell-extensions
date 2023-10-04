import { z } from 'zod'

export const settingsSchema = z.object({
  apiKey: z.string({ errorMap: () => ({ message: 'Missing api key' }) }).min(1),
})
