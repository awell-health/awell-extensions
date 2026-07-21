import { z } from 'zod'
import { MetriportWebhookType } from './types'

const metaSchema = z.object({
  messageId: z.string(),
  when: z.string(),
  requestId: z.string().optional(),
  data: z.unknown().optional(),
})

const adtEventPayloadSchema = z.object({
  url: z.string().url(),
  patientId: z.string(),
  externalId: z.string().optional(),
  additionalIds: z.record(z.array(z.string())).optional(),
  admitTimestamp: z.string(),
  dischargeTimestamp: z.string().optional(),
  whenSourceSent: z.string().optional(),
})

/**
 * A patient entry as sent by the `medical.*` webhook family. Only `patientId`
 * is required; everything else is optional and unknown fields are preserved
 * (`passthrough`) since the discharge summary event is undocumented.
 */
const medicalPatientEntrySchema = z
  .object({
    patientId: z.string(),
    externalId: z.string().optional(),
    additionalIds: z.record(z.array(z.string())).optional(),
    status: z.string().optional(),
    bundle: z.unknown().optional(),
    url: z.string().url().optional(),
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
    dischargeTimestamp: z.string(),
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
  ping: z.string(),
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
