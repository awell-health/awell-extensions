import {
  type Bundle,
  type Encounter,
  type Reference,
  type Resource,
} from '@medplum/fhirtypes'
import { isNil } from 'lodash'

/** The first resource of the given type in the bundle, if any. */
const findResource = <T extends Resource>(
  bundle: Bundle,
  resourceType: T['resourceType'],
): T | undefined =>
  bundle.entry?.find((entry) => entry.resource?.resourceType === resourceType)
    ?.resource as T | undefined

export const findEncounter = (bundle: Bundle): Encounter | undefined =>
  findResource<Encounter>(bundle, 'Encounter')

/**
 * The id a FHIR reference names, from `<type>/<id>` or `urn:uuid:<id>`: the id
 * of the resource in the system the bundle came from. Nothing when it names none.
 */
export const referencedId = (
  reference: Reference | undefined,
): string | undefined => {
  const id = reference?.reference?.split('/').pop()?.replace('urn:uuid:', '')
  return isNil(id) || id === '' ? undefined : id
}

/**
 * The resources of the given type the references point at, in their order,
 * found in the bundle by `<type>/<id>` or by the entry's `urn:uuid:<id>` full
 * URL. A reference to a resource the bundle does not carry is skipped: there is
 * nothing to write for it. A resource referenced twice is returned once.
 */
export const findReferenced = <T extends Resource>(
  bundle: Bundle,
  resourceType: T['resourceType'],
  references: Array<Reference | undefined>,
): T[] => {
  const found = references.flatMap((reference) => {
    const id = referencedId(reference)
    if (isNil(id)) return []
    const resource = bundle.entry?.find(
      (entry) =>
        entry.resource?.resourceType === resourceType &&
        (entry.resource.id === id || entry.fullUrl === `urn:uuid:${id}`),
    )?.resource as T | undefined
    return isNil(resource) ? [] : [resource]
  })
  // Two references to one resource are one record, saved and pointed at once.
  return [...new Set(found)]
}

/**
 * The key every message about one visit converges on: the Encounter's visit
 * number (HL7 `VN`, PV1-19), or Metriport's Encounter id when it carries none.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const visitIdFrom = (encounter: Encounter): string | undefined => {
  const visitNumber = encounter.identifier?.find((identifier) =>
    identifier.type?.coding?.some((coding) => coding.code === 'VN'),
  )?.value
  return visitNumber ?? encounter.id
}
