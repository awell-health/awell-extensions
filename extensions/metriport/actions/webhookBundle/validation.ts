import { z } from 'zod'

export const getWebhookBundleSchema = z.object({
  url: z
    .string({ errorMap: () => ({ message: 'Missing url' }) })
    .trim()
    .url({ message: 'A valid bundle URL is required' }),
})
