export enum BroadcastStatus {
  CREATED = 'created',
  READY = 'ready',
  BROADCASTING = 'broadcasting',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

export interface BroadcastWebhookPayload {
  broadcastID: number
  broadcastStatus: BroadcastStatus
}

export interface BroadcastWebhookNotification {
  eventId: string
  eventType: string
  createdAt: string
  version: string
}

export interface BroadcastStatusNotification {
  notification: BroadcastWebhookNotification
  payload: BroadcastWebhookPayload
}
