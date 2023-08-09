export enum TriggerEvent {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
}
export interface CalComWebhookPayload {
  triggerEvent: TriggerEvent
  createdAt: string
  payload: { uid: string; bookingId: number }
}
