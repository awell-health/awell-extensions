import {
  type CodeableConcept,
  type Condition,
  type HumanName,
  type Location,
  type Practitioner,
} from '@medplum/fhirtypes'
import { isEmpty, isUndefined, omitBy } from 'lodash'
import {
  type ConditionRecord,
  type LocationRecord,
  type PractitionerRecord,
} from './schemas'

/** A coding of a concept whose system is not fixed by FHIR, so is kept whole. */
export interface Coding {
  system?: string
  code?: string
  display?: string
}

/**
 * Drops the keys a resource did not carry, so a save writes only what the
 * message knows. Cast because lodash widens the value type and the shape is
 * only ever narrowed here, never changed.
 */
export const compact = <T extends object>(value: T): T =>
  omitBy(value, isUndefined) as T

/**
 * The code of a concept drawn from a value set FHIR fixes, so the system adds
 * nothing a constant could not restore — `class` is always v3-ActCode, a
 * Location type always v3-RoleCode, a clinical status always
 * condition-clinical. Storing the code alone keeps the object readable without
 * losing anything: the bundle it came from is retained whole and is what
 * reaches the FHIR store.
 */
export const codeOf = (concept?: CodeableConcept): string | undefined =>
  concept?.coding?.[0]?.code

/** The same, for an element FHIR allows to repeat but Metriport sends once. */
export const firstCodeOf = (concepts?: CodeableConcept[]): string | undefined =>
  codeOf(concepts?.[0])

/**
 * Every coding of a concept whose system genuinely varies — a Condition may be
 * coded in SNOMED and ICD-10 at once, and Metriport's serviceType arrives with
 * no system at all. Nothing here is recoverable from a constant, so all of it
 * is kept.
 */
export const codingsFrom = (
  concept?: CodeableConcept,
): Coding[] | undefined => {
  const codings = concept?.coding?.map((coding) =>
    compact({
      system: coding.system,
      code: coding.code,
      display: coding.display,
    }),
  )
  return isEmpty(codings) ? undefined : codings
}

/** The concept's own text, or the first coding's display when it has none. */
export const textOf = (concept?: CodeableConcept): string | undefined =>
  concept?.text ?? concept?.coding?.[0]?.display

/** A name as one string: `Dr. Maria Rodriguez`, from the parts FHIR splits it into. */
const displayNameOf = (name?: HumanName): string | undefined => {
  const parts = [
    name?.prefix?.join(' '),
    name?.given?.join(' '),
    name?.family,
  ].filter((part) => !isEmpty(part))
  return isEmpty(parts) ? undefined : parts.join(' ')
}

export const locationFrom = (
  location: Location,
): LocationRecord | undefined => {
  if (isUndefined(location.id)) return undefined

  return compact({
    metriportId: location.id,
    name: location.name,
    status: location.status,
    // `mode` is dropped with it: an ADT Location is an `instance`, which is
    // also FHIR's default.
    type: firstCodeOf(location.type),
  })
}

export const practitionerFrom = (
  practitioner: Practitioner,
): PractitionerRecord | undefined => {
  if (isUndefined(practitioner.id)) return undefined

  // `name.use` is dropped: Metriport sends the official name and nothing else
  // to choose between.
  const name = practitioner.name?.[0]
  const qualifications = practitioner.qualification
    ?.map((qualification) => codeOf(qualification.code))
    .filter((code): code is string => !isUndefined(code))

  return compact({
    metriportId: practitioner.id,
    name: displayNameOf(name),
    prefix: name?.prefix?.join(' '),
    given: name?.given?.join(' '),
    family: name?.family,
    qualifications: isEmpty(qualifications) ? undefined : qualifications,
  })
}

export const conditionFrom = (
  condition: Condition,
): ConditionRecord | undefined => {
  if (isUndefined(condition.id)) return undefined

  // `subject` is dropped: the record already resolves the patient, and a
  // Condition reached through this Encounter is about that patient.
  return compact({
    metriportId: condition.id,
    text: textOf(condition.code),
    codes: codingsFrom(condition.code),
    clinicalStatus: codeOf(condition.clinicalStatus),
    verificationStatus: codeOf(condition.verificationStatus),
    category: firstCodeOf(condition.category),
    // Only the dateTime form: `onsetAge`, `onsetPeriod` and the rest are other
    // shapes entirely, and Metriport sends a dateTime.
    onsetAt: condition.onsetDateTime,
    recordedAt: condition.recordedDate,
  })
}
