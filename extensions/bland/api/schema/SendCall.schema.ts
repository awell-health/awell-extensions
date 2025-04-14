import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'
import {
  BackgroundTrackSchema,
  ModelSchema,
  VoicemailActionSchema,
  WebhookEventsSchema,
} from './atoms'

export const SendCallInputSchema = z
  .object({
    pathway_id: z.string().optional(),
    pathway_version: z.number().optional(),
    phone_number: z.string().min(1), // For best results, use the E.164 format.
    task: z.string().min(1).optional(),
    voice: z.string().optional(),
    background_track: BackgroundTrackSchema.optional(),
    first_sentence: z.string().optional(),
    wait_for_greeting: z.boolean().optional(),
    block_interruptions: z.boolean().optional(),
    interruption_threshold: z.number().optional(),
    model: ModelSchema.optional(),
    temperature: z.number().optional(),
    dynamic_data: z.array(z.record(z.string(), z.unknown())).optional(),
    keywords: z.array(z.string()).optional(),
    pronunciation_guide: z.array(z.record(z.string(), z.string())).optional(),
    transfer_phone_number: z.string().optional(),
    transfer_list: z.record(z.string(), z.string()).optional(),
    language: z.string().optional(),
    local_dialing: z.boolean().optional(),
    voicemail_sms: z.record(z.string(), z.string()).optional(),
    dispatch_hours: z.record(z.string(), z.string()).optional(),
    sensitive_voicemail_detection: z.boolean().optional(),
    noise_cancellation: z.boolean().optional(),
    ignore_button_press: z.boolean().optional(),
    timezone: z.string().optional(),
    request_data: z.record(z.string(), z.any()).optional(),
    tools: z.array(z.record(z.string(), z.any())).optional(),
    start_time: z.string().optional(),
    voicemail_message: z.string().optional(),
    voicemail_action: VoicemailActionSchema.optional(),
    retry: z
      .object({
        wait: z.number(),
        voicemail_action: VoicemailActionSchema,
        voicemail_message: z.string(),
      })
      .optional(),
    max_duration: z.number().optional(),
    record: z.boolean().optional(),
    from: z.string().optional(),
    webhook: z.string().optional(),
    webhook_events: WebhookEventsSchema.optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    analysis_preset: z.string().optional(),
    available_tags: z.array(z.string()).optional(),
    geospatial_dialing: z.string().optional(),
    precall_dtmf_sequence: z.string().optional(),
    // Can't the below parameters in the docs anymore
    start_node_id: z.string().optional(),
    summary_prompt: z.string().optional(),
    analysis_prompt: z.string().optional(),
    analysis_schema: z.record(z.string(), z.any()).optional(),
    answered_by_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (isNil(data.pathway_id) && isEmpty(data.pathway_id)) {
        return !isNil(data.task) && !isEmpty(data.task)
      }
      return true
    },
    {
      message: '`task` is required when not providing a `pathway_id`',
      path: ['task'],
    },
  )
  .refine((data) => {
    if (isNil(data.timezone)) return true

    try {
      return (
        Intl.DateTimeFormat(undefined, {
          timeZone: data.timezone,
        }).resolvedOptions().timeZone === data.timezone
      )
    } catch {
      return false
    }
  }, 'Invalid timezone. Must be a valid IANA timezone format')

export type SendCallInputType = z.infer<typeof SendCallInputSchema>

export const SendCallResponseSchema = z.object({
  status: z.string(),
  call_id: z.string().uuid(),
  message: z.string(),
})

export type SendCallResponseType = z.infer<typeof SendCallResponseSchema>
