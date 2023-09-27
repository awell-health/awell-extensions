export interface AdtEventWebhookPayload {
  message_id: string
  source: string
  time: string
  resourceId: string
  ownerId: string
  resourceIncluded: boolean
  resource: { UPID: string }
}

export enum EncounterStatus {
  Admitted = 'admitted',
  Discharged = 'discharged',
}

export const HL7EventType = {
  A01: {
    code: 'A01',
    description: 'Admit/Visit Notification',
    fullCode: 'ADT^A01',
  },
  A03: {
    code: 'A03',
    description: 'Discharge/End Visit',
    fullCode: 'ADT^A03',
  },
}
