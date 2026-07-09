import { z } from 'zod'

export const SendSmsChannelSchema = z.enum(['sms', 'whatsapp', 'imessage'])
export const SendSmsPersonaVersionSchema = z.enum(['production', 'draft'])

export const SendSmsInputSchema = z
  .object({
    to: z.string().min(1), // For best results, use the E.164 format.
    agent_number: z.string().min(1), // Must belong to the authenticated account.
    text: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    new_conversation: z.boolean().optional(),
    persona_id: z.string().optional(),
    persona_version: SendSmsPersonaVersionSchema.optional(),
    persona_settings: z.record(z.string(), z.any()).optional(),
    pathway_id: z.string().optional(),
    pathway_version: z.string().optional(),
    start_node_id: z.string().optional(),
    webhook: z.string().optional(),
    request_data: z.record(z.string(), z.any()).optional(),
    outcome_ids: z.array(z.string()).optional(),
    citation_schema_ids: z.array(z.string()).optional(),
    channel: SendSmsChannelSchema.optional(),
    content_sid: z.string().optional(),
    content_variables: z.record(z.string(), z.any()).optional(),
    time_out: z.number().optional(),
    timeout_message: z.string().optional(),
    warning_time: z.number().optional(),
    warning_message: z.string().optional(),
  })
  .passthrough()

export type SendSmsInputType = z.infer<typeof SendSmsInputSchema>

/**
 * The Send SMS endpoint wraps its payload in a `data` object and returns an
 * `errors` field that is `null` on success.
 * @see https://docs.bland.ai/api-v1/post/sms-send
 */
export const SendSmsResponseSchema = z.object({
  data: z
    .object({
      message: z.string(),
      conversation_id: z.string(),
      workflow_id: z.string().optional(),
      message_id: z.string().optional(),
    })
    .nullable()
    .optional(),
  errors: z.array(z.any()).nullable().optional(),
})

export type SendSmsResponseType = z.infer<typeof SendSmsResponseSchema>
