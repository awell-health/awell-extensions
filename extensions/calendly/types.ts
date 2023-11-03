export enum TriggerEvent {
  EVENT_CREATED = 'invitee.created',
  EVENT_CANCELLED = 'invitee.canceled',
}
export interface CalendlyWebhookPayload {
  event: TriggerEvent
  created_at: string
  payload: {
    scheduled_event: {
      start_time: string,
      end_time: string,
      uri: string,
      event_type: string,
      event_memberships: Array<{
        user: string,
        user_email: string
      }>,
      location: any
    }
    email: string
    first_name: string
    last_name: string
    name: string
    status: 'active' | 'canceled'
    timezone: string
    rescheduled: boolean,
    cancel_url: string,
    reschedule_url: string
  }
}
