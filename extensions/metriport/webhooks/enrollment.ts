import { isNil } from 'lodash'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { isWebhookRequestAuthorized } from '../shared/verifyWebhookSignature'
import {
  EnrollmentEventType,
  MetriportWebhookType,
  type MetriportEnrollmentWebhookPayload,
} from './types'
import { webhookPayloadSchema, type WebhookPayloadSchema } from './validation.zod'

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
  whenSourceSent: {
    key: 'whenSourceSent',
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

type AdmitWebhook = Extract<
  WebhookPayloadSchema,
  { meta: { type: MetriportWebhookType.PatientAdmit } }
>
type DischargeSummaryWebhook = Extract<
  WebhookPayloadSchema,
  { meta: { type: MetriportWebhookType.DischargeSummary } }
>

const isAdmit = (webhook: WebhookPayloadSchema): webhook is AdmitWebhook =>
  webhook.meta.type === MetriportWebhookType.PatientAdmit

const isDischargeSummary = (
  webhook: WebhookPayloadSchema,
): webhook is DischargeSummaryWebhook =>
  webhook.meta.type === MetriportWebhookType.DischargeSummary

export const enrollment: Webhook<
  keyof typeof dataPoints,
  MetriportEnrollmentWebhookPayload,
  typeof settings
> = {
  key: 'enrollment',
  description:
    'Enrolls a patient when Metriport sends a real-time notification. Distinguishes between admit (`adt`, from `patient.admit`) and `discharge` (from `medical.discharge-summary`) events via the `eventType` data point. The FHIR bundle is not fetched here — the pre-signed URL is passed on the `bundleUrl` data point and can be retrieved later with the "Get Webhook Bundle" action.',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
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

      // We enroll on admit (adt) and discharge-summary events only. Every other
      // notification type (patient.discharge, patient.transfer, ...) is
      // acknowledged with a 200 but does not enroll a patient.
      //
      // The bundle referenced by `bundleUrl` is intentionally NOT fetched here:
      // we validate, emit the data points (including the URL), and reply
      // immediately. The bundle is fetched later via the "Get Webhook Bundle"
      // action.
      let data_points: DataPoints
      let patientId: string | undefined

      if (isAdmit(webhook)) {
        const event = webhook.payload
        patientId = event.patientId
        data_points = {
          eventType: EnrollmentEventType.Adt,
          metriportPatientId: event.patientId,
          externalId: event.externalId ?? '',
          admitTimestamp: event.admitTimestamp ?? '',
          whenSourceSent: event.whenSourceSent ?? '',
          messageId: webhook.meta.messageId,
          bundleUrl: event.url ?? '',
        }
      } else if (isDischargeSummary(webhook)) {
        const patient = webhook.patients?.[0]
        patientId = patient?.patientId ?? webhook.payload?.patientId
        data_points = {
          eventType: EnrollmentEventType.Discharge,
          metriportPatientId: patientId ?? '',
          externalId: patient?.externalId ?? webhook.payload?.externalId ?? '',
          admitTimestamp: '',
          whenSourceSent: '',
          messageId: webhook.meta.messageId,
          bundleUrl: patient?.url ?? webhook.payload?.url ?? '',
        }
      } else {
        await onError({
          response: {
            statusCode: 200,
            message: `Ignoring unhandled event type: ${webhook.meta.type}`,
          },
        })
        return
      }

      if (isNil(patientId) || patientId.length === 0) {
        await onError({
          response: {
            statusCode: 400,
            message: 'Unable to determine the Metriport patient ID from the payload',
          },
        })
        return
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

export type Enrollment = typeof enrollment
