import { isNil } from 'lodash'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import {
  rateLimitDurationSchema,
  transformRateLimitDuration,
  type settings,
} from '../settings'
import { shouldDedupe } from '../shared/shouldDedupe'
import { isWebhookRequestAuthorized } from '../shared/verifyWebhookSignature'
import {
  MetriportWebhookType,
  type MetriportRealtimeUpdateWebhookPayload,
} from './types'
import {
  isAdtWebhookType,
  pingWebhookSchema,
  realtimeNotificationSchema,
  webhookEnvelopeSchema,
} from './validation.zod'

/**
 * The identifier system used to enroll a patient based on their Metriport
 * patient ID.
 */
export const METRIPORT_PATIENT_IDENTIFIER_SYSTEM = 'https://metriport.com'

const dataPoints = {
  eventType: {
    key: 'eventType',
    valueType: 'string',
  },
  metriportPatientId: {
    key: 'metriportPatientId',
    valueType: 'string',
  },
  externalId: {
    key: 'externalId',
    valueType: 'string',
  },
  /**
   * `meta.when` — the single event timestamp. It is the admit time on an admit
   * event and the discharge time on a discharge event, which is why there are
   * no per-event `*Timestamp` data points.
   */
  when: {
    key: 'when',
    valueType: 'date',
  },
  messageId: {
    key: 'messageId',
    valueType: 'string',
  },
  bundleUrl: {
    key: 'bundleUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

type DataPoints = Record<keyof typeof dataPoints, string>

export const realtimeUpdate: Webhook<
  keyof typeof dataPoints,
  MetriportRealtimeUpdateWebhookPayload,
  typeof settings
> = {
  key: 'realtimeUpdate',
  description:
    'Starts a care flow when Metriport sends a real-time patient notification. Enrolls on `patient.admit`, `patient.discharge`, `patient.transfer` and `medical.discharge-summary`, which share one payload shape; the `eventType` data point carries the Metriport webhook type so it can be distinguished on. Any other notification type is acknowledged with a 200 without enrolling. The FHIR bundle is not fetched here — the pre-signed URL is passed on the `bundleUrl` data point and can be retrieved later with the "Get Webhook Bundle" action.',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings, endpoint },
    onSuccess,
    onError,
    helpers: { rateLimiter },
  }) => {
    try {
      // Verify the Metriport webhook signature (HMAC-SHA256 over the raw body)
      // when a webhook key is configured. See `verifyWebhookSignature.ts`.
      if (
        !isWebhookRequestAuthorized({
          webhookKey: settings.webhookKey,
          rawBody,
          headers,
        })
      ) {
        await onError({
          response: {
            statusCode: 401,
            message: 'Invalid or missing x-metriport-signature header',
          },
        })
        return
      }

      // Parsed permissively first. Metriport POSTs every webhook type to this
      // one endpoint, so an unrecognised `meta.type` must be readable enough to
      // acknowledge — rejecting it would make Metriport retry forever.
      const envelope = webhookEnvelopeSchema.parse(payload)
      const eventType = envelope.meta.type

      // Acknowledge Metriport's verification ping without enrolling anyone.
      // Metriport expects the response to echo back the ping value as `pong`.
      // https://docs.metriport.com/medical-api/getting-started/webhooks#the-ping-message
      if (eventType === MetriportWebhookType.Ping) {
        const { ping } = pingWebhookSchema.parse(payload)
        await onError({
          response: {
            statusCode: 200,
            message: `pong: ${ping}`,
          },
        })
        return
      }

      if (!isAdtWebhookType(eventType)) {
        await onError({
          response: {
            statusCode: 200,
            message: `Ignoring unhandled event type: ${eventType}`,
          },
        })
        return
      }

      // Strict from here on: the type is an ADT one, so a malformed payload is
      // a real problem and must not be swallowed by the 200 above.
      //
      // The bundle referenced by `bundleUrl` is intentionally NOT fetched here:
      // we validate, emit the data points (including the URL), and reply
      // immediately. The bundle is fetched later via the "Get Webhook Bundle"
      // action.
      const { meta, payload: event } = realtimeNotificationSchema.parse(payload)
      const patientId = event.patientId

      const data_points: DataPoints = {
        eventType: meta.type,
        metriportPatientId: patientId,
        externalId: event.externalId ?? '',
        when: meta.when,
        messageId: meta.messageId,
        bundleUrl: event.url,
      }

      // rate limiting
      //
      // Keyed on the guaranteed-unique `meta.messageId`. Metriport reuses the
      // same messageId on retries, so this acts as an idempotency/dedup guard:
      // a duplicate delivery of the same message within the configured window is
      // acknowledged with 200 OK (so Metriport stops retrying) but does not
      // re-enroll the patient. Distinct messages always pass.
      //
      // We only add this rate limiter in production — see `shouldDedupe`.
      //
      if (shouldDedupe()) {
        const { success, data: durationString } =
          rateLimitDurationSchema.safeParse(settings.rateLimitDuration)
        if (success && !isNil(durationString)) {
          const duration = transformRateLimitDuration(durationString)
          const limiterName = `metriport-enrollment-${meta.type}-${endpoint?.id ?? 'global'}`
          const limiter = rateLimiter(limiterName, {
            requests: 1,
            duration,
          })
          const key = meta.messageId
          const { success } = await limiter.limit(key)
          if (!success) {
            await onError({
              response: {
                statusCode: 200,
                message: `Rate limit exceeded on limiter ${limiterName} for messageId ${key}. 200 OK response sent to Metriport to prevent re-enrolling patient ${patientId} for a duplicate delivery of this message on endpoint ${endpoint?.url ?? 'global'}.`,
              },
            })
            return
          }
        }
      }

      await onSuccess({
        data_points,
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: patientId,
        },
      })
    } catch (error) {
      const message =
        error instanceof ZodError
          ? fromZodError(error).message
          : (error as Error).message
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: message },
            error: {
              category:
                error instanceof ZodError ? 'WRONG_INPUT' : 'SERVER_ERROR',
              message,
            },
          },
        ],
      })
    }
  },
}

export type RealtimeUpdate = typeof realtimeUpdate
