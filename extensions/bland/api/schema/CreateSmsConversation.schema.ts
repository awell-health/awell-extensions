import { z } from 'zod'

export const CreateSmsConversationInputSchema = z
  .object({
    user_number: z.string().min(1), // For best results, use the E.164 format.
    agent_number: z.string().min(1), // Must be a Bland-owned SMS-enabled number.
    message: z.string().min(1), // The message seeded into the conversation (recorded, not sent).
    /**
     * Required by the live API even though Bland docs mark it optional
     * (omitting it returns 400 MISSING_REQUIRED_FIELDS). It is a Twilio
     * correlation id; a generated UUID is acceptable.
     */
    message_sid: z.string().min(1),
    curr_pathway_id: z.string().optional(),
    curr_pathway_version: z.string().optional(),
    current_node_id: z.string().optional(),
    sender: z.enum(['USER', 'AGENT']).optional(),
    new_conversation: z.boolean().optional(),
    request_data: z.record(z.string(), z.any()).optional(),
  })
  .passthrough()

export type CreateSmsConversationInputType = z.infer<
  typeof CreateSmsConversationInputSchema
>

export const CreateSmsConversationResponseSchema = z
  .object({
    data: z
      .object({
        conversation_id: z.string().optional(),
        status: z.string().optional(),
      })
      .passthrough()
      .nullish(),
    errors: z.array(z.any()).nullish(),
  })
  .passthrough()

export type CreateSmsConversationResponseType = z.infer<
  typeof CreateSmsConversationResponseSchema
>
