import { z } from 'zod'

export const webhookPayloadSchema = z
.object({
  resourceType: z.string(),
  id: z.string(),
  active: z.boolean(),
})

