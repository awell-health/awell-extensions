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
 * A coding of a concept whose system genuinely varies, kept whole. Where FHIR
 * fixes the system instead — `class`, a Location type, a clinical status — the
 * record holds the bare code and the system is left to be restored from a
 * constant.
 */
const codingSchema = z.object({
  system: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
})

/**
 * What the Encounter says about its relationship to one of the resources it
 * points at, as opposed to what that resource is. The Encounter is the hub, so
 * these become the links on the saved Encounter once the resource has been
 * saved and has an Awell id.
 *
 * Carried on the resource rather than in a parallel array because one
 * Encounter references a given resource once: a patient who genuinely moves
 * ward arrives as a second ADT message with its own bundle, not as a second
 * entry here.
 */
const stayLinkSchema = z.object({
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
})

const participationLinkSchema = stayLinkSchema.extend({
  /** v3-ParticipationType, e.g. `ATND` for the attending practitioner. */
  role: z.string().optional(),
})

const diagnosisLinkSchema = z.object({
  /** diagnosis-role, e.g. `AD` for the final diagnosis. */
  use: z.string().optional(),
  rank: z.number().optional(),
})

export const locationRecordSchema = z.object({
  /** Metriport's own resource id: the key this Location upserts on. */
  metriportId: z.string().min(1),
  name: z.string().optional(),
  status: z.string().optional(),
  /** v3-RoleCode, e.g. `HOSP`. */
  type: z.string().optional(),
  encounter: stayLinkSchema.optional(),
})

export const practitionerRecordSchema = z.object({
  metriportId: z.string().min(1),
  /** The whole name as one string, beside the parts it was assembled from. */
  name: z.string().optional(),
  prefix: z.string().optional(),
  given: z.string().optional(),
  family: z.string().optional(),
  /** v2-0360, e.g. `MD`. */
  qualifications: z.array(z.string()).optional(),
  encounter: participationLinkSchema.optional(),
})

export const conditionRecordSchema = z.object({
  metriportId: z.string().min(1),
  text: z.string().optional(),
  codes: z.array(codingSchema).optional(),
  /** condition-clinical, e.g. `active`. */
  clinicalStatus: z.string().optional(),
  /** condition-ver-status, e.g. `confirmed`. */
  verificationStatus: z.string().optional(),
  /** condition-category, e.g. `encounter-diagnosis`. */
  category: z.string().optional(),
  onsetAt: z.string().optional(),
  recordedAt: z.string().optional(),
  encounter: diagnosisLinkSchema.optional(),
})

export type LocationRecord = z.infer<typeof locationRecordSchema>
export type PractitionerRecord = z.infer<typeof practitionerRecordSchema>
export type ConditionRecord = z.infer<typeof conditionRecordSchema>

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
  /** v3-ActCode, e.g. `AMB`. */
  class: z.string().optional(),
  /** Kept whole: Metriport sends this one without a system. */
  serviceType: z
    .object({
      codes: z.array(codingSchema).optional(),
      text: z.string().optional(),
    })
    .optional(),
  reason: z.string().optional(),
  /**
   * What the Encounter points at. Each is saved as an object of its own and
   * linked from the Encounter, so these are absent — not empty — on a message
   * whose bundle carries none, and a later message never clears what an
   * earlier one recorded.
   */
  locations: z.array(locationRecordSchema).optional(),
  practitioners: z.array(practitionerRecordSchema).optional(),
  conditions: z.array(conditionRecordSchema).optional(),
  bundle: bundleSchema,
})

export type AdtRecord = z.infer<typeof adtRecordSchema>
