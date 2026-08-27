import { z } from 'zod'

export const getWebhookBundleSchema = z.object({
  url: z
    .string({ error: 'Missing url' })
    .trim()
    .pipe(z.url({ error: 'A valid bundle URL is required' })),
  eventType: z.string().trim().optional(),
  provenanceReason: z.string().trim().optional(),
})
