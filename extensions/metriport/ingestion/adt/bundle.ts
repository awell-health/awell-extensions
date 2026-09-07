import {
  type Bundle,
  type Encounter,
  type Patient,
  type Resource,
} from '@medplum/fhirtypes'

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

/**
 * Demographics as the bundle's Patient states them. Identity is the subject's
 * key, so no identifier is written here; this is the same write path a
 * correction on a later delivery takes. Only what the ADT feed reliably
 * carries for now; the rest of the bundle is modelled later.
 */
export const demographicsFrom = (bundle: Bundle): Record<string, unknown> => {
  const patient = findResource<Patient>(bundle, 'Patient')
  return {
    ...(patient?.name !== undefined ? { name: patient.name } : {}),
    ...(patient?.gender !== undefined ? { gender: patient.gender } : {}),
    ...(patient?.birthDate !== undefined
      ? { birthDate: patient.birthDate }
      : {}),
  }
}
