import { z } from 'zod'

export const SendMessageResponseSchema = z.object({
  dispatch_id: z.string(),
})

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>
