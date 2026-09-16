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
 * The resource a reference inside the bundle points at.
 *
 * Both forms have to be matched, because Metriport mixes them: entries are
 * keyed by a `urn:uuid:` `fullUrl` while references between them use the
 * relative `<Type>/<id>` form, which FHIR does not consider a match for that
 * fullUrl. The transformation in `actions/webhookBundle/bundle/references.ts`
 * closes the same gap from the other side, by rewriting the references.
 *
 * The relative form also states the type, and it is checked: a
 * `diagnosis.condition` may point at a Procedure rather than a Condition, and
 * that is a resource this mapping has nowhere to put.
 */
export const resolveReference = <T extends Resource>(
  bundle: Bundle,
  reference?: Reference,
): T | undefined => {
  const pointer = reference?.reference
  if (isNil(pointer)) return undefined

  const [type, id] = pointer.split('/')

  return bundle.entry?.find(
    (entry) =>
      entry.fullUrl === pointer ||
      (entry.resource?.resourceType === type && entry.resource?.id === id),
  )?.resource as T | undefined
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
