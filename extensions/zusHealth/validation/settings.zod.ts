import { z } from 'zod'

export const settingsSchema = z.object({
  base_url: z.string({ error: 'Missing base URL' }).min(1),
  auth_url: z.string({ error: 'Missing auth URL' }).min(1),
  client_id: z.string({ error: 'Missing client ID' }).min(1),
  client_secret: z.string({ error: 'Missing client secret' }).min(1),
  audience: z.string({ error: 'Missing audience' }).min(1),
})
