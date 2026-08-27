import { z } from 'zod'

export const settingsSchema = z.object({
  base_url: z.string({ error: 'Missing base_url' }).min(1),
  auth_url: z.string({ error: 'Missing auth_url' }).min(1),
  client_id: z.string({ error: 'Missing client_id' }).min(1),
  client_secret: z.string({ error: 'Missing client_secret' }).min(1),
})
