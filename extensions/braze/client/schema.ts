import { z } from 'zod'

const SendMessageResponseSchema = z.object({
  dispatch_id: z.string(),
})

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>
