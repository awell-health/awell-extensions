import {
  PayloadValidationError,
  unhandled,
  withSettings,
} from '@awell-health/extensions-core'
import { type Condition, type Encounter } from '@medplum/fhirtypes'
import { isNil, isUndefined, omitBy } from 'lodash'
import { fetchBundle } from '../../shared/fetchBundle'
import { METRIPORT_IDENTIFIER_SYSTEM } from '../../shared/identifierSystem'
import { type settings } from '../../settings'
import { MetriportWebhookType } from '../../webhooks/types'
import { isAdtWebhookType } from '../../webhooks/validation.zod'
import {
  findEncounter,
  findReferenced,
  referencedId,
  visitIdFrom,
} from './bundle'
import {
  CONDITION_OBJECT,
  ENCOUNTER_OBJECT,
  ENCOUNTER_STATUS_SYSTEM,
  LOCATION_OBJECT,
  METRIPORT_CONDITION_IDENTIFIER_SYSTEM,
  METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
  METRIPORT_LOCATION_IDENTIFIER_SYSTEM,
  METRIPORT_ORGANIZATION_IDENTIFIER_SYSTEM,
  ORGANIZATION_OBJECT,
  codingOf,
  codingsOf,
  orgRef,
  statusCoding,
  toCoding,
} from './catalog'
import { adtRecordSchema, notificationSchema } from './schemas'

/**
 * Where the bundle of one message is kept: a retry of the message replaces it.
 * The id is one path segment whatever it holds, and never `.` or `..`.
 */
const bundleObjectName = (messageId: string): string => {
  const segment = encodeURIComponent(messageId)
  const safe = /^\.{1,2}$/.test(segment)
    ? segment.replace(/\./g, '%2E')
    : segment
  return `metriport/adt/${safe}/bundle.json`
}

/** Drops what a message does not carry, so a save never clears a field an earlier message set. */
const known = (data: Record<string, unknown>): Record<string, unknown> =>
  omitBy(data, isUndefined)

/** A list, or nothing when it is empty: an empty list would clear what an earlier message wrote. */
const nonEmpty = <T>(items: T[]): T[] | undefined =>
  items.length > 0 ? items : undefined

/** A Condition: the patient's record, upserted on `awell_identifier`. */
const conditionData = (
  condition: Condition & { id: string },
  patientId: string,
): Record<string, unknown> =>
  known({
    awell_identifier: {
      system: METRIPORT_CONDITION_IDENTIFIER_SYSTEM,
      value: condition.id,
    },
    awell_code: codingOf(condition.code),
    awell_clinical_status: codingOf(condition.clinicalStatus),
    awell_verification_status: codingOf(condition.verificationStatus),
    awell_category: codingsOf(condition.category),
    awell_severity: codingOf(condition.severity),
    awell_subject: patientId,
    awell_onset_at: condition.onsetDateTime,
    awell_abatement_at: condition.abatementDateTime,
    awell_recorded_at: condition.recordedDate,
  })

/**
 * The Encounter as the catalog holds it. Its Locations and service provider are
 * the organization's: pointed at by Metriport's ids for them, never written.
 * Status follows the message, not the
 * bundle: a discharge closes the visit whatever status the bundle repeats.
 * FHIR allows several types and reasons, and the catalog holds every coding of
 * each; a service type and a discharge disposition are one concept, held as
 * one coding.
 */
const encounterData = (
  encounter: Encounter,
  visit: {
    visitId: string
    closed: boolean
    patientId: string
    admittedAt: string | undefined
    dischargedAt: string | undefined
    conditionIds: string[] | undefined
  },
): Record<string, unknown> =>
  known({
    awell_identifier: {
      system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
      value: visit.visitId,
    },
    awell_status: statusCoding(
      ENCOUNTER_STATUS_SYSTEM,
      visit.closed ? 'finished' : 'in-progress',
    ),
    awell_class: toCoding(encounter.class),
    awell_type: codingsOf(encounter.type),
    awell_service_type: codingOf(encounter.serviceType),
    awell_subject: visit.patientId,
    awell_period_start: visit.admittedAt,
    awell_period_end: visit.dischargedAt,
    awell_location: nonEmpty(
      (encounter.location ?? []).flatMap(({ location }) => {
        const id = referencedId(location)
        return isNil(id)
          ? []
          : [orgRef(LOCATION_OBJECT, METRIPORT_LOCATION_IDENTIFIER_SYSTEM, id)]
      }),
    ),
    awell_service_provider: serviceProviderRef(encounter),
    awell_reason: codingsOf(encounter.reasonCode),
    awell_diagnosis: visit.conditionIds,
    awell_discharge_disposition: codingOf(
      encounter.hospitalization?.dischargeDisposition,
    ),
  })

/** The Organization the Encounter names as its service provider, by Metriport's id for it. */
const serviceProviderRef = (
  encounter: Encounter,
): ReturnType<typeof orgRef> | undefined => {
  const id = referencedId(encounter.serviceProvider)
  return isNil(id)
    ? undefined
    : orgRef(ORGANIZATION_OBJECT, METRIPORT_ORGANIZATION_IDENTIFIER_SYSTEM, id)
}

const hasId = <T extends { id?: string }>(
  resource: T,
): resource is T & { id: string } => !isNil(resource.id) && resource.id !== ''

/**
 * Metriport posts every real-time notification to one URL, discriminated on
 * `meta.type`, with the clinical data behind a presigned `payload.url` (a FHIR
 * bundle, valid for 600 s). Admit, transfer, discharge and the discharge
 * summary all converge on one encounter keyed on the visit.
 *
 * What is written follows Awell's catalog field for field: the Encounter and
 * the Conditions diagnosed in it, the patient's records. The Locations it took
 * place at and its service provider are the organization's directory, which an
 * ingestion never writes: the Encounter points at them by Metriport's ids, and
 * a reference the directory cannot resolve is left out. The patient is created by identifier
 * resolution and its demographics are not written yet; the rest of what the
 * bundle carries (the discharge summary document) is modelled later. The bundle itself is too large to travel with the record: it
 * goes to the object store, and FHIR data movement, which listens for
 * `fhir.bundle-received`, reads its reference from the retained record.
 * https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications
 */
export const metriportAdt = withSettings<typeof settings>().endpoint({
  key: 'metriportAdt',
  title: 'Metriport ADT notifications',
  description:
    'Receives Metriport real-time patient notifications. Handles `patient.admit`, `patient.transfer`, `patient.discharge` and `patient.discharge-summary`, downloading the FHIR bundle each points at; any other notification type is acknowledged without producing a record.',
  source: 'webhook',
  // TODO: enable verification after the pre-release: `import { verify } from './verify'`
  // and set `verify` here. The verifier and its tests are kept in verify.ts.
  schema: { envelope: notificationSchema, payload: adtRecordSchema },
  getRecords: async ({ envelope, helpers }) => {
    const { meta, payload } = envelope

    // Metriport's set of types is open and grows without asking. Not ours: no
    // record, so no subject is resolved and no patient is minted.
    if (!isAdtWebhookType(meta.type)) return []

    // Strict from here on: the type is one we handle, so a malformed payload is
    // a real problem and must not be swallowed by the acknowledge path above.
    if (isNil(payload)) {
      throw new PayloadValidationError(
        `${meta.type} notification carries no payload`,
      )
    }

    const bundle = await fetchBundle(payload.url)
    const encounter = findEncounter(bundle)
    const visitId = isNil(encounter) ? undefined : visitIdFrom(encounter)
    if (isNil(encounter) || isNil(visitId)) {
      throw new PayloadValidationError(
        `${meta.type} bundle at ${payload.url} carries no Encounter to key the visit on`,
      )
    }

    // Named after the message, so a redelivery or a reprocess replaces the
    // object rather than leaving a second copy.
    const bundleRef = await helpers.objectStore.put(
      bundleObjectName(meta.messageId),
      JSON.stringify(bundle),
    )

    return [
      {
        event: meta.type,
        messageId: meta.messageId,
        externalId: payload.externalId,
        metriportPatientId: payload.patientId,
        visitId,
        admittedAt: payload.admitTimestamp ?? encounter.period?.start,
        dischargedAt: payload.dischargeTimestamp ?? encounter.period?.end,
        bundleRef,
        encounter,
        conditions: findReferenced<Condition>(
          bundle,
          'Condition',
          (encounter.diagnosis ?? []).map(({ condition }) => condition),
        ),
      },
    ]
  },
  // No `system`: the runtime defaults it to the extension's `identifier.system`.
  // `externalId` is the id the patient was created in Metriport with, not
  // Metriport's UUID, so every other feed about the patient matches on it.
  identifier: { resolveValue: (record) => record.externalId },
  run: async ({ record, store, events }) => {
    const closed =
      record.event === MetriportWebhookType.PatientDischarge ||
      record.event === MetriportWebhookType.DischargeSummary

    // Saving the identifier the record was resolved by changes nothing; it
    // answers the patient's id, which every patient record names as its subject.
    const patient = store.save('patient', {
      identifier: {
        system: METRIPORT_IDENTIFIER_SYSTEM,
        value: record.externalId,
      },
    })

    // A Condition without an id has nothing to be found again by, so every
    // message about the visit would mint another: it is skipped.
    const conditions = record.conditions
      .filter(hasId)
      .map((condition) =>
        store.save(CONDITION_OBJECT, conditionData(condition, patient.id)),
      )

    // Upsert key: every message about this visit converges on ONE encounter.
    // Only what this message knows is written: an admit carries no discharge
    // time and a discharge summary no service type, and neither should clear
    // what an earlier message about the same visit already set.
    const savedEncounter = store.save(
      ENCOUNTER_OBJECT,
      encounterData(record.encounter, {
        visitId: record.visitId,
        closed,
        patientId: patient.id,
        admittedAt: record.admittedAt,
        dischargedAt: record.dischargedAt,
        conditionIds: nonEmpty(conditions.map(({ id }) => id)),
      }),
    )

    // Every handled message carries a bundle, so every record says so. This is
    // what FHIR data movement listens for; the event points at the stored
    // bundle by the key the object store answered, a pointer and never the data.
    events.publish({ key: 'fhir.bundle-received', ref: record.bundleRef })

    // The clinical events are about the visit: they point at the Encounter by
    // the id `save` answered, under its catalog key (`encounter`, not the FHIR
    // spelling). It may be a draft id, which the platform swaps for the
    // committed one.
    const encounterRef = `encounter/${savedEncounter.id}`

    // `record.event` is our union, not Metriport's: getRecords already dropped
    // what we do not handle, so this switch is genuinely closed.
    switch (record.event) {
      case MetriportWebhookType.PatientAdmit:
        events.publish({ key: 'patient.admitted', ref: encounterRef })
        break
      case MetriportWebhookType.PatientTransfer:
        events.publish({ key: 'patient.transferred', ref: encounterRef })
        break
      case MetriportWebhookType.PatientDischarge:
        events.publish({ key: 'patient.discharged', ref: encounterRef })
        break
      case MetriportWebhookType.DischargeSummary:
        // Same envelope, supplemental bundle: more detail about a discharge
        // already recorded, converging on the same encounter. The document
        // itself is not modelled yet; it is reachable through `bundleRef`.
        events.publish({ key: 'discharge.summary-received' })
        break
      default:
        unhandled(record.event)
    }
  },
})
