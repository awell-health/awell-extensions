import { type Condition, type Encounter } from '@medplum/fhirtypes'
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

/**
 * A FHIR resource carried verbatim. Only its type is checked here; the type is
 * the fhirtypes one so `run` and the tests see the real shape. How it maps
 * onto the catalog is `run`'s concern.
 */
const fhirResource = <T extends { resourceType: string }>(
  resourceType: T['resourceType'],
): z.ZodCustom<T, T> =>
  z.custom<T>(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      (value as T).resourceType === resourceType,
    { error: `Expected a FHIR ${resourceType}` },
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
 *
 * The bundle itself is NOT here: it can run to megabytes and the record is
 * retained per ingestion, so `getRecords` puts it in the object store and the
 * record carries the reference. What `run` writes travels with it: the
 * Encounter, and the Conditions it points at. The Locations and the service
 * provider are the organization's and are only pointed at, through the
 * Encounter's own references.
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
  /** The bundle, in the object store: what FHIR data movement reads. */
  bundleRef: z.string().min(1),
  encounter: fhirResource<Encounter>('Encounter'),
  /** The Conditions `encounter.diagnosis` points at, as the bundle carries them. */
  conditions: z.array(fhirResource<Condition>('Condition')),
})

export type AdtRecord = z.infer<typeof adtRecordSchema>
