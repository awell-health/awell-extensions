import { defineEndpoint } from '@awell-health/extensions-core'
import { isUndefined, omitBy } from 'lodash'
import { z } from 'zod'
import {
  CLINICAL_STATUSES,
  CONDITION_IDENTIFIER_SYSTEM,
  CONDITION_OBJECT,
  DISCHARGE_DISPOSITIONS,
  ENCOUNTER_CLASSES,
  ENCOUNTER_DIAGNOSIS,
  ENCOUNTER_IDENTIFIER_SYSTEM,
  ENCOUNTER_OBJECT,
  ENCOUNTER_STATUSES,
  SEVERITIES,
  SEX_CODES,
  VERIFICATION_STATUSES,
  type RecordRef,
  clinicalStatus,
  dischargeDisposition,
  encounterRef,
  encounterStatus,
  icd10,
  locationRef,
  organizationRef,
  verificationStatus,
} from './catalog'

const trimmedString = z.string().trim()
const id = trimmedString.min(1)
const timestamp = z.iso.datetime({ offset: true })
const keysOf = <T extends Record<string, unknown>>(
  object: T,
): [keyof T & string, ...Array<keyof T & string>] =>
  Object.keys(object) as [keyof T & string, ...Array<keyof T & string>]

const encounterSchema = z.looseObject({
  visit_id: id,
  class: z.enum(keysOf(ENCOUNTER_CLASSES)),
  /** Derived from `discharged_at` when omitted: finished once discharged, in progress until then. */
  status: z.enum(ENCOUNTER_STATUSES).optional(),
  admitted_at: timestamp.optional(),
  discharged_at: timestamp.optional(),
  /** The id of a Location the organization already holds in the workbench. */
  facility_id: id.optional(),
  /** The id of an Organization the organization already holds in the workbench. */
  service_provider_id: id.optional(),
  discharge_disposition: z.enum(DISCHARGE_DISPOSITIONS).optional(),
})

const conditionSchema = z.looseObject({
  condition_id: id,
  /**
   * The visit the condition was diagnosed in. Omit it to link the payload's own `encounter`; name another visit to
   * link one an earlier payload ingested.
   */
  visit_id: id.optional(),
  icd10_code: id,
  description: trimmedString.optional(),
  clinical_status: z.enum(CLINICAL_STATUSES).optional(),
  verification_status: z.enum(VERIFICATION_STATUSES).optional(),
  severity: z.enum(keysOf(SEVERITIES)).optional(),
  onset_at: timestamp.optional(),
  recorded_at: timestamp.optional(),
  note: trimmedString.optional(),
})

/**
 * Experimental. The payload is the record: one POST is one patient, and optionally one encounter at a facility and
 * one condition diagnosed in it. Everything but the subject key is optional so a partial payload still ingests what
 * it carries.
 */
export const dataIngestionSchema = z.looseObject({
  patient_id: id,
  /** More of the patient's identifiers, such as a hospital MRN, each under its own system. */
  identifiers: z
    .array(z.object({ system: z.url(), value: id }))
    .min(1)
    .optional(),
  first_name: trimmedString.optional(),
  last_name: trimmedString.optional(),
  birth_date: z.iso.date().optional(),
  sex: z.enum(keysOf(SEX_CODES)).optional(),
  email: z.email().optional(),
  address: z
    .looseObject({
      street: trimmedString.optional(),
      city: trimmedString.optional(),
      state: trimmedString.optional(),
      zip: trimmedString.optional(),
      country: trimmedString.optional(),
    })
    .optional(),
  encounter: encounterSchema.optional(),
  condition: conditionSchema.optional(),
})

type EncounterInput = z.infer<typeof encounterSchema>
type ConditionInput = z.infer<typeof conditionSchema>

/** Drops what a payload does not carry, so a save never clears a field an earlier payload set. */
const known = (data: Record<string, unknown>): Record<string, unknown> =>
  omitBy(data, isUndefined)

const statusOf = (encounter: EncounterInput): string =>
  encounter.status ??
  (isUndefined(encounter.discharged_at) ? 'in-progress' : 'finished')

/** The Encounter, upserted on the visit id, at the Location the facility id names. */
const encounterData = (
  encounter: EncounterInput,
  status: string,
): Record<string, unknown> =>
  known({
    identifier: {
      system: ENCOUNTER_IDENTIFIER_SYSTEM,
      value: encounter.visit_id,
    },
    class: ENCOUNTER_CLASSES[encounter.class],
    status: encounterStatus(status),
    period_start: encounter.admitted_at,
    period_end: encounter.discharged_at,
    location: isUndefined(encounter.facility_id)
      ? undefined
      : [locationRef(encounter.facility_id)],
    service_provider: isUndefined(encounter.service_provider_id)
      ? undefined
      : organizationRef(encounter.service_provider_id),
    discharge_disposition: isUndefined(encounter.discharge_disposition)
      ? undefined
      : dischargeDisposition(encounter.discharge_disposition),
  })

/**
 * The encounter a condition was diagnosed in: this payload's, by the id its save answered, or an earlier payload's,
 * by its visit id. Nothing when the condition names no visit and the payload carries no encounter.
 */
const encounterOfCondition = (
  condition: ConditionInput,
  encounter: { visitId: string; id: string } | undefined,
): string | RecordRef | undefined => {
  if (isUndefined(condition.visit_id)) return encounter?.id
  return condition.visit_id === encounter?.visitId
    ? encounter.id
    : encounterRef(condition.visit_id)
}

/** The Condition, upserted on its id, pointing at the encounter it was diagnosed in when there is one. */
const conditionData = (
  condition: ConditionInput,
  encounterId: string | RecordRef | undefined,
): Record<string, unknown> =>
  known({
    identifier: {
      system: CONDITION_IDENTIFIER_SYSTEM,
      value: condition.condition_id,
    },
    code: icd10(condition.icd10_code, condition.description),
    clinical_status: isUndefined(condition.clinical_status)
      ? undefined
      : clinicalStatus(condition.clinical_status),
    verification_status: isUndefined(condition.verification_status)
      ? undefined
      : verificationStatus(condition.verification_status),
    category: isUndefined(encounterId) ? undefined : [ENCOUNTER_DIAGNOSIS],
    severity: isUndefined(condition.severity)
      ? undefined
      : SEVERITIES[condition.severity],
    encounter: encounterId,
    onset_at: condition.onset_at,
    recorded_at: condition.recorded_at,
    note: condition.note,
  })

export const dataIngestion = defineEndpoint({
  key: 'dataIngestion',
  title: 'Data ingestion (experimental)',
  description:
    'Experimental endpoint. POST a patient payload, optionally with an `encounter` at a facility and a `condition` diagnosed in it. Writes the demographics, the Encounter (pointing at the Location the facility id names) and the Condition (pointing at the Encounter) to the data store, and publishes events for care flows. Identifies the patient by `patient_id`.',
  source: 'webhook',
  schema: dataIngestionSchema,
  identifier: { resolveValue: (record) => record.patient_id },
  run: async ({ record, store, events }) => {
    const demographics = known({
      identifier: record.identifiers,
      first_name: record.first_name,
      last_name: record.last_name,
      birth_date: record.birth_date,
      sex: isUndefined(record.sex) ? undefined : SEX_CODES[record.sex],
      email: record.email,
      address: isUndefined(record.address) ? undefined : known(record.address),
    })
    if (Object.keys(demographics).length > 0)
      store.save('patient', demographics)

    // The encounter is saved first so the condition can name it: a save may only reference one written before it.
    const status = isUndefined(record.encounter)
      ? undefined
      : statusOf(record.encounter)
    const encounter =
      isUndefined(record.encounter) || isUndefined(status)
        ? undefined
        : {
            visitId: record.encounter.visit_id,
            id: store.save(
              ENCOUNTER_OBJECT,
              encounterData(record.encounter, status),
            ).id,
          }

    if (!isUndefined(record.condition)) {
      store.save(
        CONDITION_OBJECT,
        conditionData(
          record.condition,
          encounterOfCondition(record.condition, encounter),
        ),
      )
    }

    events.publish({ key: 'careflow.start' })
    events.publish({ key: 'ingestion.testing' })
    if (status === 'finished') events.publish({ key: 'patient.discharged' })
    if (status === 'arrived' || status === 'in-progress')
      events.publish({ key: 'patient.admitted' })
  },
})
