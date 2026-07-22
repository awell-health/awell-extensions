export interface SmsConversationHistoryEntry {
  sender?: 'AGENT' | 'USER' | string
  message?: string
  status?: string
  timestamp?: string
}

export interface CompletedBlandTextWebhookPayload {
  type?: string
  conversation_id?: string
  status?: string
  channel?: string
  phone_number?: string
  agent_number?: string
  conversation_history?: SmsConversationHistoryEntry[]
  pathway_id?: string
  pathway_version?: string
  message_count?: number
  ended_at?: string
  reason?: string
  variables?: Record<string, unknown>
  metadata?: {
    awell_patient_id?: string
    awell_activity_id?: string
    awell_care_flow_id?: string
    awell_care_flow_definition_id?: string
    [key: string]: unknown
  }
  created_at?: string
  concatenated_transcript?: string
}
