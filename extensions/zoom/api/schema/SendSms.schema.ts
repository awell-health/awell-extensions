import { z } from 'zod'

export const SendSmsInputSchema = z.object({
  contact_center_number: z.string(),
  consumer_numbers: z.array(z.string()),
  body: z.string(),
})

export type SendSmsInputType = z.infer<typeof SendSmsInputSchema>

export const SendSmsResponseSchema = z.array(
  z.object({
    contact_center_number: z.string(),
    consumer_number: z.string(),
    message_id: z.string().optional(),
    success: z.boolean(),
    description: z.string().optional(),
  }),
)

export type SendSmsResponseType = z.infer<typeof SendSmsResponseSchema>
