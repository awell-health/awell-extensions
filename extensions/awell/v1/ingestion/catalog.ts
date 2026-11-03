/**
 * Where `dataIngestion` writes: Awell's core objects as the data workbench names them, by key alone. Encounter and
 * Condition are the patient's records and are written. Location and Organization are the organization's directory: an
 * ingestion never writes one, it points at a record the organization already holds, by identifier.
 */
export const ENCOUNTER_OBJECT = 'encounter'
export const CONDITION_OBJECT = 'condition'
export const LOCATION_OBJECT = 'location'
export const ORGANIZATION_OBJECT = 'organization'

/**
 * The sender's system of record. Every record it sends is identified under this one system by the sender's own id:
 * the patient's MRN, an encounter, a condition, and the Location or Organization an encounter points at. A Location or
 * Organization must carry an identifier under it in the workbench for an encounter's reference to resolve.
 */
export const IDENTIFIER_SYSTEM = 'https://acme.com'

/** A coding as the catalog stores it. */
export interface CatalogCoding {
  system: string
  code: string
  display?: string
}

const coding = (
  system: string,
  code: string,
  display?: string,
): CatalogCoding =>
  display === undefined ? { system, code } : { system, code, display }

/** Encounter class (`encounter_class`), from FHIR's v3 ActCode. */
const ACT_CODE = 'http://terminology.hl7.org/CodeSystem/v3-ActCode'
export const ENCOUNTER_CLASSES = {
  inpatient: coding(ACT_CODE, 'IMP', 'inpatient encounter'),
  emergency: coding(ACT_CODE, 'EMER', 'emergency'),
  ambulatory: coding(ACT_CODE, 'AMB', 'ambulatory'),
  observation: coding(ACT_CODE, 'OBSENC', 'observation encounter'),
  virtual: coding(ACT_CODE, 'VR', 'virtual'),
  home: coding(ACT_CODE, 'HH', 'home health'),
} as const

/** Encounter status (`encounter_status`). */
export const ENCOUNTER_STATUSES = [
  'planned',
  'arrived',
  'in-progress',
  'finished',
  'cancelled',
] as const
export const encounterStatus = (code: string): CatalogCoding =>
  coding('http://hl7.org/fhir/encounter-status', code)

export const DISCHARGE_DISPOSITIONS = [
  'home',
  'alt-home',
  'other-hcf',
  'hosp',
  'long',
  'aadvice',
  'exp',
  'psy',
  'rehab',
  'snf',
  'oth',
] as const
export const dischargeDisposition = (code: string): CatalogCoding =>
  coding('http://terminology.hl7.org/CodeSystem/discharge-disposition', code)

/** Condition code: ICD-10-CM, with the sender's description as its display. */
export const icd10 = (code: string, display?: string): CatalogCoding =>
  coding('http://hl7.org/fhir/sid/icd-10-cm', code, display)

/** Condition clinical status (`condition_clinical`). */
export const CLINICAL_STATUSES = [
  'active',
  'recurrence',
  'relapse',
  'inactive',
  'remission',
  'resolved',
] as const
export const clinicalStatus = (code: string): CatalogCoding =>
  coding('http://terminology.hl7.org/CodeSystem/condition-clinical', code)

/** Condition verification status (`condition_ver_status`). */
export const VERIFICATION_STATUSES = [
  'unconfirmed',
  'provisional',
  'differential',
  'confirmed',
  'refuted',
  'entered-in-error',
] as const
export const verificationStatus = (code: string): CatalogCoding =>
  coding('http://terminology.hl7.org/CodeSystem/condition-ver-status', code)

/** Condition category (`condition_category`): a condition arriving with an encounter is that encounter's diagnosis. */
export const ENCOUNTER_DIAGNOSIS = coding(
  'http://terminology.hl7.org/CodeSystem/condition-category',
  'encounter-diagnosis',
  'Encounter Diagnosis',
)

/** Condition severity, as SNOMED CT codes it. */
const SNOMED = 'http://snomed.info/sct'
export const SEVERITIES = {
  mild: coding(SNOMED, '255604002', 'Mild'),
  moderate: coding(SNOMED, '6736007', 'Moderate'),
  severe: coding(SNOMED, '24484000', 'Severe'),
} as const

/** The patient profile stores sex as a number: not known 0, male 1, female 2. */
export const SEX_CODES = { unknown: 0, male: 1, female: 2 } as const

export interface RecordRef {
  $ref: { object: string; identifier: { system: string; value: string } }
}

/**
 * A reference to a record by the identifier the sender gives it. The runtime looks it up in the patient's records,
 * then the organization's, and stores `<object>/<record id>`; one neither holds is left out and logged.
 */
const refTo =
  (object: string, system: string) =>
  (value: string): RecordRef => ({
    $ref: { object, identifier: { system, value } },
  })

/** A Location of the organization's directory. */
export const locationRef = refTo(LOCATION_OBJECT, IDENTIFIER_SYSTEM)
/** An Organization of the organization's directory. */
export const organizationRef = refTo(ORGANIZATION_OBJECT, IDENTIFIER_SYSTEM)
/** One of the patient's Encounters, ingested by an earlier payload. */
export const encounterRef = refTo(ENCOUNTER_OBJECT, IDENTIFIER_SYSTEM)
