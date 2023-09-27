export interface PatientAdmittedWebhookPayload {
  message_id: string
  source: string
  time: string
  resourceId: string
  ownerId: string
  resourceIncluded: boolean
  resource: { UPID: string }
}

export interface PatientDischargedWebhookPayload {
  message_id: string
  source: string
  time: string
  resourceId: string
  ownerId: string
  resourceIncluded: boolean
  resource: { UPID: string }
}
