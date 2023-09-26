export interface EncounterWebhookPayload {
  message_id: string
  source: string
  time: string
  resourceId: string
  ownerId: string
  resourceIncluded: boolean
  resource: { UPID: string }
}
