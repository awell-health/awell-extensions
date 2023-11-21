export enum TriggerEvent {
  INVITEE_CREATED = 'invitee.created',
  INVITEE_CANCELLED = 'invitee.canceled',
  INVITEE_NO_SHOW_CREATED = 'invitee_no_show.created',
  ROUTING_FORM_SUBMISSION_CREATED = 'routing_form_submission.created',
}

interface QuestionAndAnswer {
  question: string
  answer: string
  position: number
}
interface Tracking {
  utm_campaign: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_content: string | null
  utm_term: string | null
  salesforce_uuid: string | null
}
export interface CalendlyWebhookPayload {
  event: TriggerEvent
  created_at: string
  created_by: string
  payload: {
    created_at: string
    updated_at: string
    text_reminder_number: string | null
    event: string
    scheduled_event: {
      start_time: string
      end_time: string
      uri: string
      event_type: string
      event_memberships: Array<{
        user: string
        user_email: string
      }>
      location: any
      name: string
      status: 'active' | 'canceled'
      invitees_counter: {
        total: number
        active: number
        limit: number
      }
      created_at: string
      updated_at: string
      event_guests: Array<{
        email: string
        created_at: string
        // apparently this field is missing from the example...
        updated_at?: string
      }>
    }
    uri: string
    email: string
    name: string
    status: 'active' | 'canceled'
    timezone: string
    rescheduled: boolean
    cancel_url: string
    reschedule_url: string
    new_invitee: string | null
    old_invitee: string | null
    questions_and_answers: QuestionAndAnswer[]
    tracking: Tracking
    // all of the below fields are missing from the exmaple
    // though they are stated as required in docs
    first_name?: string | null
    last_name?: string | null
    no_show?: { uri: string; created_at: string } | null
    reconfirmation?: { confirmed_at: string; created_at: string } | null
    payment?: null // not supporting payment right now.
    invitee_scheduled_by?: string | null
    routing_form_submission?: string | null
    scheduling_method?: string | null
  }
}

export type CalendlyInviteeCreatedWebhook = CalendlyWebhookPayload & {
  event: TriggerEvent.INVITEE_CREATED
  payload: {
    status: 'active'
  }
}

export type CalendlyInviteeCanceledWebhook = CalendlyWebhookPayload & {
  event: TriggerEvent.INVITEE_CANCELLED
  payload: {
    cancellation: {
      canceled_by: string
      reason: string | null
      canceler_type: 'host' | 'invitee'
      created_at: string
    }
    status: 'canceled'
  }
}
