import { z } from 'zod'

export const settingsSchema = z.object({
  clientId: z
    .string({ errorMap: () => ({ message: 'Missing client_id' }) })
    .min(1),
  clientSecret: z
    .string({ errorMap: () => ({ message: 'Missing client_secret' }) })
    .min(1),
})
