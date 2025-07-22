import { z } from 'zod'

export const zFaxReceivedWebhookPayload = z.object({
  jobId: z.string().min(1),
  prod: z.string().min(1),
  dir: z.string().min(1),
})

export type FaxReceivedWebhookPayload = z.infer<
  typeof zFaxReceivedWebhookPayload
>
