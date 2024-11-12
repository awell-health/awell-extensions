import { z } from 'zod'

export const SendCallInputSchema = z.object({
  phone_number: z.string().min(1), // For best results, use the E.164 format.
  task: z.string().min(1),
  pathway_id: z.string().optional(),
  start_node_id: z.string().optional(),
  voice: z.string().optional(),
  background_track: z.string().optional(),
  first_sentence: z.string().optional(),
  wait_for_greeting: z.boolean().optional(),
  block_interruptions: z.boolean().optional(),
  interruption_threshold: z.number().optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  keywords: z.array(z.string()).optional(),
  pronunciation_guide: z.array(z.record(z.string(), z.string())).optional(),
  transfer_phone_number: z.string().optional(),
  transfer_list: z.record(z.string(), z.string()).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  request_data: z.record(z.string(), z.any()).optional(),
  tools: z.array(z.record(z.string(), z.any())).optional(),
  dynamic_data: z
    .array(
      z.object({
        response_data: z.array(z.record(z.string(), z.any())),
      })
    )
    .optional(),
  start_time: z.string().optional(),
  voicemail_message: z.string().optional(),
  voicemail_action: z.record(z.string(), z.any()).optional(),
  retry: z.record(z.string(), z.any()).optional(),
  max_duration: z.number().optional(),
  record: z.boolean().optional(),
  from: z.string().optional(),
  webhook: z.string().optional(),
  webhook_events: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  summary_prompt: z.string().optional(),
  analysis_prompt: z.string().optional(),
  analysis_schema: z.record(z.string(), z.any()).optional(),
  answered_by_enabled: z.boolean().optional(),
})

export type SendCallInputType = z.infer<typeof SendCallInputSchema>

export const SendCallResponseSchema = z.object({
  status: z.string(),
  call_id: z.string().uuid(),
  message: z.string(),
})

export type SendCallResponseType = z.infer<typeof SendCallResponseSchema>
