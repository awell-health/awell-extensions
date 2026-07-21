import { isNil } from 'lodash'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import {
  EnrollmentEventType,
  MetriportWebhookType,
  type MetriportEnrollmentWebhookPayload,
} from './types'
import { webhookPayloadSchema } from './validation.zod'
import { fetchEncounterBundle } from './encounterBundle'

/**
 * The identifier system used to enroll a patient based on their Metriport
 * patient ID.
 */
export const METRIPORT_PATIENT_IDENTIFIER_SYSTEM =
  'https://metriport.com/fhir/patient'

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
  admitTimestamp: {
    key: 'admitTimestamp',
    valueType: 'date',
  },
  dischargeTimestamp: {
    key: 'dischargeTimestamp',
    valueType: 'date',
  },
  whenSourceSent: {
    key: 'whenSourceSent',
    valueType: 'date',
  },
  messageId: {
    key: 'messageId',
    valueType: 'string',
  },
  encounterBundle: {
    key: 'encounterBundle',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const enrollment: Webhook<
  keyof typeof dataPoints,
  MetriportEnrollmentWebhookPayload,
  typeof settings
> = {
  key: 'enrollment',
  description:
    'Enrolls a patient when Metriport sends a real-time ADT notification. Distinguishes between admit (`adt`) and `discharge` events via the `eventType` data point.',
  dataPoints,
  onEvent: async ({
    payload: { payload, headers, settings },
    onSuccess,
    onError,
  }) => {
    try {
      // Verify the webhook key when one is configured.
      const { webhookKey } = settings
      if (!isNil(webhookKey) && webhookKey.length > 0) {
        const providedKeyHeader = headers['x-webhook-key']
        const providedKey = Array.isArray(providedKeyHeader)
          ? providedKeyHeader[0]
          : providedKeyHeader
        if (providedKey !== webhookKey) {
          await onError({
            response: {
              statusCode: 401,
              message: 'Invalid or missing x-webhook-key header',
            },
          })
          return
        }
      }

      const webhook = webhookPayloadSchema.parse(payload)

      // Acknowledge Metriport's verification ping without enrolling anyone.
      if ('ping' in webhook) {
        await onError({
          response: {
            statusCode: 200,
            message: `Ping received: ${webhook.ping}`,
          },
        })
        return
      }

      // We only enroll on admit (adt) and discharge events. Transfers (and any
      // other notification type) are acknowledged but not acted upon.
      const eventType =
        webhook.meta.type === MetriportWebhookType.PatientAdmit
          ? EnrollmentEventType.Adt
          : webhook.meta.type === MetriportWebhookType.PatientDischarge
            ? EnrollmentEventType.Discharge
            : undefined

      if (isNil(eventType)) {
        await onError({
          response: {
            statusCode: 200,
            message: `Ignoring unhandled event type: ${webhook.meta.type}`,
          },
        })
        return
      }

      const event = webhook.payload

      // Fetch the FHIR Encounter Bundle. The pre-signed URL is only valid for
      // 10 minutes, so we retrieve it while handling the webhook. A failure
      // here should not block enrollment.
      let encounterBundle = ''
      try {
        encounterBundle = JSON.stringify(await fetchEncounterBundle(event.url))
      } catch {
        encounterBundle = ''
      }

      await onSuccess({
        data_points: {
          eventType,
          metriportPatientId: event.patientId,
          messageId: webhook.meta.messageId,
          externalId: event.externalId ?? '',
          admitTimestamp: event.admitTimestamp ?? '',
          dischargeTimestamp: event.dischargeTimestamp ?? '',
          whenSourceSent: event.whenSourceSent ?? '',
          encounterBundle,
        },
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: event.patientId,
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

export type Enrollment = typeof enrollment
