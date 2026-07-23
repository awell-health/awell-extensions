import { z } from 'zod'
import { MetriportWebhookType } from './types'

/**
 * Incoming string values are trimmed so stray whitespace never leaks into
 * data points, identifiers, or the pre-signed URLs we pass downstream.
 */
const trimmedString = z.string().trim()

const metaSchema = z.object({
  messageId: trimmedString,
  when: trimmedString,
  requestId: trimmedString.optional(),
  data: z.unknown().optional(),
})

const adtEventPayloadSchema = z.object({
  url: trimmedString.url(),
  patientId: trimmedString,
  externalId: trimmedString.optional(),
  additionalIds: z.record(z.array(trimmedString)).optional(),
  admitTimestamp: trimmedString,
  dischargeTimestamp: trimmedString.optional(),
  whenSourceSent: trimmedString.optional(),
})

/**
 * A patient entry as sent by the `medical.*` webhook family. Only `patientId`
 * is required; everything else is optional and unknown fields are preserved
 * (`passthrough`) since the discharge summary event is undocumented.
 */
const medicalPatientEntrySchema = z
  .object({
    patientId: trimmedString,
    externalId: trimmedString.optional(),
    additionalIds: z.record(z.array(trimmedString)).optional(),
    status: trimmedString.optional(),
    bundle: z.unknown().optional(),
    url: trimmedString.url().optional(),
  })
  .passthrough()

const patientAdmitWebhookSchema = z.object({
  meta: metaSchema.extend({
    type: z.literal(MetriportWebhookType.PatientAdmit),
  }),
  payload: adtEventPayloadSchema,
})

const patientDischargeWebhookSchema = z.object({
  meta: metaSchema.extend({
    type: z.literal(MetriportWebhookType.PatientDischarge),
  }),
  payload: adtEventPayloadSchema.extend({
    dischargeTimestamp: trimmedString,
  }),
})

const patientTransferWebhookSchema = z.object({
  meta: metaSchema.extend({
    type: z.literal(MetriportWebhookType.PatientTransfer),
  }),
  payload: adtEventPayloadSchema,
})

const dischargeSummaryWebhookSchema = z.object({
  meta: metaSchema.extend({
    type: z.literal(MetriportWebhookType.DischargeSummary),
  }),
  patients: z.array(medicalPatientEntrySchema).optional(),
  payload: adtEventPayloadSchema.partial().optional(),
})

const pingWebhookSchema = z.object({
  meta: metaSchema.extend({
    type: z.literal(MetriportWebhookType.Ping),
  }),
  ping: trimmedString,
})

/**
 * Parses an incoming Metriport webhook. The discriminator (`meta.type`) is
 * nested, so we rely on a union rather than a discriminated union.
 */
export const webhookPayloadSchema = z.union([
  patientAdmitWebhookSchema,
  patientDischargeWebhookSchema,
  patientTransferWebhookSchema,
  dischargeSummaryWebhookSchema,
  pingWebhookSchema,
])

export type WebhookPayloadSchema = z.infer<typeof webhookPayloadSchema>
