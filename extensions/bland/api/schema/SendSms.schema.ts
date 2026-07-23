import { z } from 'zod'

export const SendSmsInputSchema = z
  .object({
    user_number: z.string().min(1), // For best results, use the E.164 format.
    agent_number: z.string().min(1), // Must be a Bland-owned SMS-enabled number.
    agent_message: z.string().optional(), // When omitted, the pathway generates the message.
    pathway_id: z.string().optional(),
    new_conversation: z.boolean().optional(),
    request_data: z.record(z.string(), z.any()).optional(),
    webhook: z.string().optional(),
    time_out: z.number().optional(), // Seconds of user silence before the timeout flow fires. Persists on the conversation.
    timeout_message: z.string().optional(), // Message sent when the timeout fires.
    warning_time: z.number().optional(), // Seconds before sending the warning message. Must be less than time_out.
    warning_message: z.string().optional(), // Warning message sent at warning_time.
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .passthrough()

export type SendSmsInputType = z.infer<typeof SendSmsInputSchema>

export const SendSmsResponseSchema = z
  .object({
    data: z
      .object({
        conversation_id: z.string().optional(),
        message_id: z.string().optional(),
        status: z.string().optional(),
      })
      .passthrough()
      .nullish(),
    errors: z.array(z.any()).nullish(),
  })
  .passthrough()

export type SendSmsResponseType = z.infer<typeof SendSmsResponseSchema>
