import {
  type Bundle,
  type CodeableConcept,
  type Condition,
  type Encounter,
} from '@medplum/fhirtypes'
import { indexBundle, resolve } from '../dischargeSummary/resolve'

/**
 * The Metriport id of the Encounter a webhook bundle describes.
 *
 * This is Metriport's own UUID, not a Medplum resource id. It is the value
 * `buildResourceEntry` stamps as `https://metriport.com/fhir/encounter|<id>`,
 * so a care flow resolves the imported Encounter with
 * `Encounter?identifier=https://metriport.com/fhir/encounter|<id>`.
 *
 * Read from any bundle rather than only a `collection`: a Patient Encounter
 * Bundle is guaranteed to carry an Encounter — `buildTransactionBundle` throws
 * without one — and there is no reason to hide the id when another bundle type
 * happens to include one.
 */
export const findEncounterId = (bundle: Bundle): string | undefined =>
  bundle.entry?.find((entry) => entry.resource?.resourceType === 'Encounter')
    ?.resource?.id

/**
 * The Encounter fields handed on as data points. Each is omitted when the
 * Encounter does not carry it, never emitted empty, so a missing field reads
 * as missing downstream rather than as a blank value.
 */
export interface EncounterFields {
  admissionDatetime?: string
  dischargeDatetime?: string
  encounterClass?: string
  encounterType?: string
  encounterLocation?: string
  encounterReason?: string
  /** JSON array of the diagnoses' display text. */
  encounterDiagnoses?: string
}

/** `Encounter.type` texts that name the setting, matched case-insensitively. */
const KNOWN_ENCOUNTER_TYPES = ['inpatient', 'ambulatory', 'emergency']

const isKnownType = (text: string): boolean => {
  const lower = text.toLowerCase()
  return KNOWN_ENCOUNTER_TYPES.some((type) => lower.includes(type))
}

const conditionLabel = (
  concept: CodeableConcept | undefined,
): string | undefined => concept?.text ?? concept?.coding?.[0]?.display

const nonEmpty = (value: string | undefined): value is string =>
  value !== undefined && value.length > 0

/**
 * The fields of the first Encounter in a webhook bundle — the same Encounter
 * `findEncounterId` reads. A diagnosis is labelled by its reference's
 * `display`, falling back to the Condition it points at when the bundle
 * carries it.
 */
export const extractEncounterFields = (bundle: Bundle): EncounterFields => {
  const encounter = bundle.entry?.find(
    (entry) => entry.resource?.resourceType === 'Encounter',
  )?.resource as Encounter | undefined
  if (encounter === undefined) return {}

  const index = indexBundle(bundle)
  const diagnoses = (encounter.diagnosis ?? [])
    .map(
      ({ condition }) =>
        condition.display ??
        conditionLabel(resolve<Condition>(index, condition, 'Condition')?.code),
    )
    .filter(nonEmpty)

  const encounterType = encounter.type
    ?.map((type) => type.text)
    .find((text) => nonEmpty(text) && isKnownType(text))
  const classDisplay = encounter.class?.display

  const fields: EncounterFields = {
    admissionDatetime: encounter.period?.start,
    dischargeDatetime: encounter.period?.end,
    // Some sources send no class, or "unknown"; the type then names the setting.
    encounterClass:
      nonEmpty(classDisplay) && classDisplay.toLowerCase() !== 'unknown'
        ? classDisplay
        : encounterType,
    encounterType,
    encounterLocation: encounter.location?.[0]?.location.display,
    encounterReason: encounter.reasonCode?.find((reason) =>
      nonEmpty(reason.text),
    )?.text,
    encounterDiagnoses:
      diagnoses.length > 0 ? JSON.stringify(diagnoses) : undefined,
  }

  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => nonEmpty(value)),
  )
}
