import { type CodeableConcept, type Coding } from '@medplum/fhirtypes'
import { isNil } from 'lodash'

/**
 * Where the ADT endpoint writes: the default objects of Awell's catalog (module-studio `catalog/awell`), under the
 * names storage gives them (`awell_<key>_default`, fields `awell_<key>`). Encounter and Condition are the patient's
 * records and are written here. Location and Organization are the organization's directory: never written by an
 * ingestion, only pointed at by identifier (`orgRef`).
 */
export const ENCOUNTER_OBJECT = 'awell_encounter_default'
export const CONDITION_OBJECT = 'awell_condition_default'
export const LOCATION_OBJECT = 'awell_location_default'
export const ORGANIZATION_OBJECT = 'awell_organization_default'

export const METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM =
  'https://metriport.com/encounter'
export const METRIPORT_LOCATION_IDENTIFIER_SYSTEM =
  'https://metriport.com/location'
export const METRIPORT_CONDITION_IDENTIFIER_SYSTEM =
  'https://metriport.com/condition'
export const METRIPORT_ORGANIZATION_IDENTIFIER_SYSTEM =
  'https://metriport.com/organization'

/** FHIR's own code systems for the status codes, which FHIR carries as bare codes. */
export const ENCOUNTER_STATUS_SYSTEM = 'http://hl7.org/fhir/encounter-status'

/** A coding as the catalog stores it: `system` and `code` required, `display` when there is one. */
export interface CatalogCoding {
  system: string
  code: string
  display?: string
}

/**
 * A FHIR Coding as the catalog holds one, or nothing when it has no system or no code: a bare code means nothing
 * without the system it is a code of, and the catalog refuses it. An empty
 * string is no system or code either.
 */
export const toCoding = (
  coding: Coding | undefined,
): CatalogCoding | undefined => {
  if (
    isNil(coding?.system) ||
    isNil(coding?.code) ||
    coding.system === '' ||
    coding.code === ''
  )
    return undefined
  return {
    system: coding.system,
    code: coding.code,
    ...(isNil(coding.display) ? {} : { display: coding.display }),
  }
}

/**
 * Every coding of every concept, for a field that holds many. Nothing, rather than an empty list, when none fits,
 * so a message that carries none never clears what an earlier one wrote.
 */
export const codingsOf = (
  concepts: CodeableConcept[] | undefined,
): CatalogCoding[] | undefined => {
  const codings = (concepts ?? [])
    .flatMap((concept) => concept.coding ?? [])
    .map(toCoding)
    .filter((coding): coding is CatalogCoding => !isNil(coding))
  return codings.length > 0 ? codings : undefined
}

/**
 * One coding for a field that holds one. The codings of one CodeableConcept are the same concept in different code
 * systems, so the first the catalog can hold stands for it.
 */
export const codingOf = (
  concept: CodeableConcept | undefined,
): CatalogCoding | undefined => codingsOf(isNil(concept) ? [] : [concept])?.[0]

/** A FHIR status code under FHIR's own system for it. */
export const statusCoding = (
  system: string,
  code: string | undefined,
): CatalogCoding | undefined => (isNil(code) ? undefined : { system, code })

/**
 * A reference to a record of the organization's directory, by the identifier
 * its source gives it. The runtime stores the id of the record that identifier
 * names, or nothing when the directory holds none (module-data-ingestion
 * `orgReferences.ts`).
 */
export const orgRef = (
  object: string,
  system: string,
  value: string,
): {
  $ref: { object: string; identifier: { system: string; value: string } }
} => ({
  $ref: { object, identifier: { system, value } },
})
