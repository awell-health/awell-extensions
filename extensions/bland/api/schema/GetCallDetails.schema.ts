import { z } from 'zod'

export const GetCallDetailsInputSchema = z.object({
  call_id: z.string().min(1),
})

export type GetCallDetailsInputType = z.infer<typeof GetCallDetailsInputSchema>

export const GetCallDetailsResponseSchema = z.object({
  call_id: z.string(),
  call_length: z.number(),
  batch_id: z.string().nullable(),
  to: z.string(),
  from: z.string(),
  request_data: z.record(z.string(), z.unknown()),
  completed: z.boolean(),
  created_at: z.string().datetime(),
  inbound: z.boolean(),
  queue_status: z.string(),
  endpoint_url: z.string(),
  max_duration: z.number(),
  error_message: z.string().nullable(),
  variables: z.record(z.string(), z.unknown()),
  answered_by: z.string(),
  record: z.boolean(),
  recording_url: z.string().nullable(),
  c_id: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  summary: z.string(),
  price: z.number(),
  started_at: z.string().datetime(),
  local_dialing: z.boolean(),
  call_ended_by: z.string(),
  pathway_logs: z.unknown().nullable(),
  analysis_schema: z.unknown().nullable(),
  analysis: z.record(z.string(), z.unknown()),
  concatenated_transcript: z.string(),
  transcripts: z.array(
    z.object({
      id: z.number(),
      created_at: z.string().datetime(),
      text: z.string(),
      user: z.string(),
      c_id: z.string(),
      status: z.string().nullable(),
      transcript_id: z.string().nullable(),
    })
  ),
  status: z.string(),
  corrected_duration: z.string(),
  end_at: z.string().datetime(),
})

export type GetCallDetailsResponseType = z.infer<
  typeof GetCallDetailsResponseSchema
>
