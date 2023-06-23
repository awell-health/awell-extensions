import { z } from 'zod'

export const addressSchema = z.object({
  use: z.enum(['home', 'work', 'temp', 'old']),
  type: z.enum(['both', 'physical', 'postal']),
  line: z.array(z.string()),
  city: z.string(),
  state: z.string().length(2),
  postalCode: z.string().regex(/[0-9]{5}/),
})
