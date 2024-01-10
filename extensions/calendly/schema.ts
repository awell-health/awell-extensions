import { z } from 'zod'
import { TriggerEvent } from './types'

export const triggerEventSchema = z.nativeEnum(TriggerEvent)

const questionAndAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  position: z.number(),
})

const trackingSchema = z.object({
  utm_campaign: z.string().nullable(),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_content: z.string().nullable(),
  utm_term: z.string().nullable(),
  salesforce_uuid: z.string().nullable(),
})

const cancellationSchema = z.object({
  canceled_by: z.string(),
  reason: z.string().nullable(),
  canceler_type: z.union([z.literal('invitee'), z.literal('host')]),
  created_at: z.string(),
})

export const baseWebhookPayloadSchema = z.object({
  event: triggerEventSchema,
  created_at: z.string(),
  created_by: z.string(),
  payload: z.object({
    created_at: z.string(),
    updated_at: z.string(),
    text_reminder_number: z.string().nullable(),
    event: z.string(),
    scheduled_event: z.object({
      start_time: z.string(),
      end_time: z.string(),
      uri: z.string(),
      event_type: z.string(),
      event_memberships: z.array(
        z.object({
          user: z.string(),
          user_email: z.string(),
        })
      ),
      location: z.any(),
      name: z.string(),
      status: z.union([z.literal('active'), z.literal('canceled')]),
      invitees_counter: z.object({
        total: z.number(),
        active: z.number(),
        limit: z.number(),
      }),
      created_at: z.string(),
      updated_at: z.string(),
      event_guests: z.array(
        z.object({
          email: z.string(),
          created_at: z.string(),
          updated_at: z.string().optional(),
        })
      ),
    }),
    uri: z.string(),
    email: z.string(),
    name: z.string(),
    status: z.union([z.literal('active'), z.literal('canceled')]),
    timezone: z.string(),
    rescheduled: z.boolean(),
    cancel_url: z.string(),
    reschedule_url: z.string(),
    new_invitee: z.string().nullable(),
    old_invitee: z.string().nullable(),
    questions_and_answers: z.array(questionAndAnswerSchema),
    tracking: trackingSchema,
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    no_show: z
      .object({
        uri: z.string(),
        created_at: z.string(),
      })
      .optional()
      .nullable(),
    reconfirmation: z
      .object({
        confirmed_at: z.string(),
        created_at: z.string(),
      })
      .optional()
      .nullable(),
    payment: z.null().optional(),
    invitee_scheduled_by: z.string().optional().nullable(),
    routing_form_submission: z.string().optional().nullable(),
    scheduling_method: z.string().optional().nullable(),
  }),
})

const canceledScheduledEventSchema =
  baseWebhookPayloadSchema.shape.payload.shape.scheduled_event.extend({
    status: z.literal('canceled'),
  })

const activeScheduledEventSchema =
  baseWebhookPayloadSchema.shape.payload.shape.scheduled_event.extend({
    status: z.literal('active'),
  })

const canceledPayload = baseWebhookPayloadSchema.shape.payload.extend({
  status: z.literal('canceled'),
  scheduled_event: canceledScheduledEventSchema,
  cancellation: cancellationSchema,
})

const activePayload = baseWebhookPayloadSchema.shape.payload.extend({
  status: z.literal('active'),
  scheduled_event: activeScheduledEventSchema,
})

export const canceledSchema = baseWebhookPayloadSchema.extend({
  payload: canceledPayload,
})

export const activeSchema = baseWebhookPayloadSchema.extend({
  payload: activePayload,
})
