import { z } from 'zod'
import { MetriportWebhookType } from './types'

/**
 * Incoming string values are trimmed so stray whitespace never leaks into
 * data points, identifiers, or the pre-signed URLs we pass downstream.
 */
const trimmedString = z.string().trim()

/**
 * The ADT notification types. All four share one payload shape; anything
 * outside this list is acknowledged without enrolling.
 */
export const ADT_WEBHOOK_TYPES = [
  MetriportWebhookType.PatientAdmit,
  MetriportWebhookType.PatientDischarge,
  MetriportWebhookType.PatientTransfer,
  MetriportWebhookType.DischargeSummary,
] as const

export type AdtWebhookType = (typeof ADT_WEBHOOK_TYPES)[number]

export const isAdtWebhookType = (type: string): type is AdtWebhookType =>
  (ADT_WEBHOOK_TYPES as readonly string[]).includes(type)

const metaSchema = z.object({
  messageId: trimmedString,
  when: trimmedString,
  requestId: trimmedString.optional(),
  data: z.unknown().optional(),
})

/**
 * The permissive first pass. Metriport POSTs every webhook type to the same
 * endpoint, so `type` is an open string here: an unrecognised notification has
 * to be readable enough to acknowledge with a 200, or Metriport retries it
 * forever.
 */
export const webhookEnvelopeSchema = z.looseObject({
  meta: metaSchema.extend({ type: trimmedString }),
})

export const pingWebhookSchema = z.object({
  meta: metaSchema.extend({ type: z.literal(MetriportWebhookType.Ping) }),
  ping: trimmedString,
})

/**
 * The strict pass, applied only once `meta.type` is known to be an ADT type.
 * A handled event with a broken payload must fail loudly rather than be
 * swallowed by the acknowledge-and-ignore path.
 */
export const realtimeNotificationSchema = z.object({
  meta: metaSchema.extend({ type: z.enum(ADT_WEBHOOK_TYPES) }),
  payload: z.object({
    url: trimmedString.url(),
    patientId: trimmedString.min(1),
    externalId: trimmedString.optional(),
    additionalIds: z.record(z.string(), z.array(trimmedString)).optional(),
  }),
})

export type WebhookEnvelopeSchema = z.infer<typeof webhookEnvelopeSchema>
export type RealtimeNotificationSchema = z.infer<
  typeof realtimeNotificationSchema
>
