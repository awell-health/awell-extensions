import { type Bundle } from '@medplum/fhirtypes'
import { z } from 'zod'
import { ADT_WEBHOOK_TYPES } from '../../webhooks/validation.zod'

const trimmedString = z.string().trim()

/**
 * The envelope: what Metriport POSTs. `meta.type` is a plain string, not an
 * enum. It is Metriport's set and it grows without asking, so a type we have
 * never heard of must parse (and produce no records) rather than 400 back to
 * a vendor for sending something perfectly valid. `payload` is optional for
 * the same reason: a ping or a `medical.document-download` carries none.
 * https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications
 */
export const notificationSchema = z.looseObject({
  meta: z.looseObject({
    messageId: trimmedString.min(1),
    when: trimmedString,
    type: trimmedString,
  }),
  payload: z
    .looseObject({
      url: trimmedString.url(),
      patientId: trimmedString.min(1),
      externalId: trimmedString.optional(),
      additionalIds: z.record(z.string(), z.array(trimmedString)).optional(),
      admitTimestamp: trimmedString.optional(),
      dischargeTimestamp: trimmedString.optional(),
      transfers: z
        .array(
          z.looseObject({
            timestamp: trimmedString.optional(),
            sourceLocation: trimmedString.optional(),
            destinationLocation: trimmedString.optional(),
          }),
        )
        .optional(),
    })
    .optional(),
})

export type Notification = z.infer<typeof notificationSchema>

const bundleSchema = z.custom<Bundle>(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    (value as Bundle).resourceType === 'Bundle',
  { error: 'Expected a FHIR Bundle' },
)

/**
 * The record: our shape, and closed. `getRecords` has already dropped what we
 * do not handle, so `event` is the union we own and `run` can switch over it
 * exhaustively.
 *
 * `externalId` is required here although optional on the envelope: it is the
 * customer's MRN and the subject key, so a notification without one has no
 * patient to attach to and is quarantined rather than minted under Metriport's
 * UUID.
 */
export const adtRecordSchema = z.object({
  event: z.enum(ADT_WEBHOOK_TYPES),
  messageId: z.string().min(1),
  externalId: z.string().min(1),
  metriportPatientId: z.string().min(1),
  /** The Encounter's visit number, or its Metriport id when it has none. */
  visitId: z.string().min(1),
  admittedAt: z.string().optional(),
  dischargedAt: z.string().optional(),
  /** Where the patient now is, as the last transfer on the notification names it. */
  location: z.string().optional(),
  bundle: bundleSchema,
})

export type AdtRecord = z.infer<typeof adtRecordSchema>
