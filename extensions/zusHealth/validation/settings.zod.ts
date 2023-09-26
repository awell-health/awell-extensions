import { z } from 'zod'

export const settingsSchema = z.object({
  base_url: z
    .string({ errorMap: () => ({ message: 'Missing base URL' }) })
    .min(1),
  auth_url: z
    .string({ errorMap: () => ({ message: 'Missing auth URL' }) })
    .min(1),
  client_id: z
    .string({ errorMap: () => ({ message: 'Missing client ID' }) })
    .min(1),
  client_secret: z
    .string({ errorMap: () => ({ message: 'Missing client secret' }) })
    .min(1),
  audience: z
    .string({ errorMap: () => ({ message: 'Missing audience' }) })
    .min(1),
})
