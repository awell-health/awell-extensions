import { isNil } from 'lodash'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { MetriportMedicalApi } from '@metriport/api-sdk'
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
import { webhookPayloadSchema, type WebhookPayloadSchema } from './validation.zod'
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
  dischargeSummary: {
    key: 'dischargeSummary',
    valueType: 'json',
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

/**
 * Serializes the FHIR data for an ADT (admit) notification. The pre-signed URL
 * is only valid for 10 minutes, so we fetch it while handling the webhook. A
 * failure here must not block enrollment.
 */
const resolveEncounterBundle = async (url: string): Promise<string> => {
  try {
    return JSON.stringify(await fetchEncounterBundle(url))
  } catch {
    return ''
  }
}

const buildAdtDataPoints = async (
  webhook: AdmitWebhook,
): Promise<DataPoints> => {
  const { payload, meta } = webhook
  return {
    eventType: EnrollmentEventType.Adt,
    metriportPatientId: payload.patientId,
    externalId: payload.externalId ?? '',
    admitTimestamp: payload.admitTimestamp ?? '',
    whenSourceSent: payload.whenSourceSent ?? '',
    messageId: meta.messageId,
    encounterBundle: await resolveEncounterBundle(payload.url),
    dischargeSummary: '',
  }
}

/**
 * Resolves the discharge summary FHIR data. It may be embedded inline
 * (`bundle`, as in `medical.consolidated-data`) or referenced by a pre-signed
 * `url`. When neither is present we fall back to serializing whatever the
 * patient entry contained so nothing is lost.
 */
const resolveDischargeSummary = async (
  webhook: DischargeSummaryWebhook,
): Promise<{ patientId?: string; externalId?: string; dischargeSummary: string }> => {
  const patient = webhook.patients?.[0]
  const patientId = patient?.patientId ?? webhook.payload?.patientId
  const externalId = patient?.externalId ?? webhook.payload?.externalId

  if (!isNil(patient?.bundle)) {
    return { patientId, externalId, dischargeSummary: JSON.stringify(patient.bundle) }
  }

  const url = patient?.url ?? webhook.payload?.url
  if (!isNil(url)) {
    return { patientId, externalId, dischargeSummary: await resolveEncounterBundle(url) }
  }

  // Nothing to fetch — capture whatever was delivered for the care flow.
  const raw = patient ?? webhook.payload
  return {
    patientId,
    externalId,
    dischargeSummary: isNil(raw) ? '' : JSON.stringify(raw),
  }
}

export const enrollment: Webhook<
  keyof typeof dataPoints,
  MetriportEnrollmentWebhookPayload,
  typeof settings
> = {
  key: 'enrollment',
  description:
    'Enrolls a patient when Metriport sends a real-time notification. Distinguishes between admit (`adt`, from `patient.admit`) and `discharge` (from `medical.discharge-summary`) events via the `eventType` data point.',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    try {
      // Verify the Metriport webhook signature when a webhook key is configured.
      // Metriport signs each request with an HMAC-SHA256 of the raw request body
      // using the webhook key, delivered in the `x-metriport-signature` header.
      // The hash must be computed over the raw body (never the re-serialized
      // payload), so we use `rawBody` here.
      // https://docs.metriport.com/medical-api/getting-started/webhooks#authentication
      const { webhookKey } = settings
      if (!isNil(webhookKey) && webhookKey.length > 0) {
        const signatureHeader = headers['x-metriport-signature']
        const signature = Array.isArray(signatureHeader)
          ? signatureHeader[0]
          : signatureHeader
        const isValidSignature =
          !isNil(signature) &&
          signature.length > 0 &&
          MetriportMedicalApi.verifyWebhookSignature(
            webhookKey,
            rawBody,
            signature,
          )
        if (!isValidSignature) {
          await onError({
            response: {
              statusCode: 401,
              message: 'Invalid or missing x-metriport-signature header',
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

      // We enroll on admit (adt) and discharge-summary events only. Every other
      // notification type (patient.discharge, patient.transfer, ...) is
      // acknowledged with a 200 but does not enroll a patient.
      let data_points: DataPoints
      let patientId: string | undefined

      if (isAdmit(webhook)) {
        data_points = await buildAdtDataPoints(webhook)
        patientId = data_points.metriportPatientId
      } else if (isDischargeSummary(webhook)) {
        const resolved = await resolveDischargeSummary(webhook)
        patientId = resolved.patientId
        data_points = {
          eventType: EnrollmentEventType.Discharge,
          metriportPatientId: resolved.patientId ?? '',
          externalId: resolved.externalId ?? '',
          admitTimestamp: '',
          whenSourceSent: '',
          messageId: webhook.meta.messageId,
          encounterBundle: '',
          dischargeSummary: resolved.dischargeSummary,
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
