export enum TriggerEvent {
  EVENT_CREATED = 'invitee.created',
  EVENT_CANCELLED = 'invitee.canceled',
}
export interface CalendlyWebhookPayload {
  event: TriggerEvent
  created_at: string
  payload: {
    scheduled_event: {
      uri: string
    }
    email: string
    first_name: string
    last_name: string
    name: string
    status: 'active' | 'canceled'
    timezone: string
    rescheduled: boolean
  }
}
