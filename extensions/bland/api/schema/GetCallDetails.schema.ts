import { z } from 'zod'

export const GetCallDetailsInputSchema = z.object({
  call_id: z.string().min(1),
})

export type GetCallDetailsInputType = z.infer<typeof GetCallDetailsInputSchema>

export const GetCallDetailsResponseSchema = z.object({
  call_id: z.string(),
  c_id: z.string(),
  call_length: z.number(),
  batch_id: z.string().nullable(),
  to: z.string(),
  from: z.string(),
  completed: z.boolean(),
  created_at: z.string().datetime(),
  inbound: z.boolean(),
  queue_status: z.string(),
  max_duration: z.number(),
  error_message: z.string().nullable(),
  variables: z.record(z.string(), z.unknown()),
  answered_by: z.string(),
  record: z.boolean(),
  recording_url: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  summary: z.string(),
  price: z.number(),
  started_at: z.string().datetime(),
  local_dialing: z.boolean(),
  call_ended_by: z.string(),
  pathway_logs: z.unknown().nullable(),
  analysis_schema: z.unknown().nullable(),
  analysis: z.record(z.string(), z.unknown()),
  transferred_to: z.unknown().nullable(),
  pathway_tags: z.array(z.unknown()),
  recording_expiration: z.unknown().nullable(),
  status: z.string(),
  pathway_id: z.string().nullable(),
  concatenated_transcript: z.string(),
  transcripts: z.array(
    z.object({
      id: z.number(),
      user: z.string(),
      text: z.string(),
      created_at: z.string().datetime(),
    }),
  ),
  corrected_duration: z.string(),
  end_at: z.string().datetime(),
})

export type GetCallDetailsResponseType = z.infer<
  typeof GetCallDetailsResponseSchema
>
