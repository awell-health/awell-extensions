export interface CallCompletedWebhookPayload {
  call_id: string
  c_id: string
  call_length: number
  batch_id: string | null
  to: string
  from: string
  completed: boolean
  created_at: string
  inbound: boolean
  queue_status: string
  max_duration: number
  error_message: string | null
  variables: Record<string, any>
  answered_by: string | null
  record: boolean
  recording_url: string | null
  metadata: Record<string, any>
  summary: string
  price: number
  started_at: string
  local_dialing: boolean
  call_ended_by: string
  pathway_logs: unknown | null
  analysis_schema: unknown | null
  analysis: Record<string, any>
  transferred_to: string | null
  pathway_tags: string[]
  recording_expiration: string | null
  status: string
  pathway_id: string | null
  concatenated_transcript: string
  transcripts: Array<Record<string, any>>
  corrected_duration: string
  end_at: string
  disposition_tag: string
}
