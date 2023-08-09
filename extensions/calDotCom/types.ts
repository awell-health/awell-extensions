export enum TriggerEvent {
  BOOKING_CREATED = 'BOOKING_CREATED',
}
export interface CalComWebhookPayload {
  triggerEvent: TriggerEvent
  createdAt: string
  payload: { uid: string; bookingId: number }
}
