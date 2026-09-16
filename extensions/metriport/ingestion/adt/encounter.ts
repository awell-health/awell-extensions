import {
  type Bundle,
  type Condition,
  type Encounter,
  type Location,
  type Practitioner,
  type Reference,
  type Resource,
} from '@medplum/fhirtypes'
import { isEmpty, isUndefined, uniqBy } from 'lodash'
import { resolveReference } from './bundle'
import {
  type Coding,
  codeOf,
  codingsFrom,
  compact,
  conditionFrom,
  firstCodeOf,
  locationFrom,
  practitionerFrom,
  textOf,
} from './resources'
import {
  type ConditionRecord,
  type LocationRecord,
  type PractitionerRecord,
} from './schemas'

/** Everything the record carries about an encounter beyond its own timings. */
export interface EncounterDetails {
  /** v3-ActCode, e.g. `AMB`. */
  class?: string
  serviceType?: { codes?: Coding[]; text?: string }
  reason?: string
  locations?: LocationRecord[]
  practitioners?: PractitionerRecord[]
  conditions?: ConditionRecord[]
}

/** One reference an encounter makes, with what the encounter says about it. */
interface Link {
  reference?: Reference
  encounter: Record<string, unknown>
}

/**
 * Resolves each reference an encounter makes, maps the resource behind it, and
 * hangs the encounter's own view of that resource — the period it was used
 * for, the role played, the rank of a diagnosis — under `encounter`.
 *
 * A reference that resolves to nothing, or to a resource of another type, is
 * dropped: `diagnosis.condition` may point at a Procedure, which this mapping
 * has nowhere to put, and an object saved hollow under an id we cannot
 * describe is worse than no object at all. Duplicates collapse on the
 * Metriport id, so the same Location referenced twice is saved once.
 */
const referenced = <R extends Resource, T extends { metriportId: string }>(
  bundle: Bundle,
  resourceType: R['resourceType'],
  links: Link[],
  map: (resource: R) => T | undefined,
): T[] | undefined => {
  const resources = links.flatMap(({ reference, encounter }) => {
    const resolved = resolveReference<R>(bundle, reference)
    if (isUndefined(resolved) || resolved.resourceType !== resourceType) {
      return []
    }

    const mapped = map(resolved)
    if (isUndefined(mapped)) return []

    const link = compact(encounter)
    return [isEmpty(link) ? mapped : { ...mapped, encounter: link }]
  })

  return isEmpty(resources)
    ? undefined
    : uniqBy(resources, (resource) => resource.metriportId)
}

/**
 * What an encounter says beyond its own identity and timings: the resources it
 * points at, each mapped and linked back, plus the coded fields describing the
 * visit itself.
 *
 * Driven entirely off the Encounter's own references rather than off the
 * bundle's contents, so nothing is attached to a visit that the visit does not
 * claim.
 */
export const encounterDetailsFrom = (
  bundle: Bundle,
  encounter: Encounter,
): EncounterDetails => {
  const serviceType = compact({
    codes: codingsFrom(encounter.serviceType),
    text: encounter.serviceType?.text,
  })

  return compact({
    class: encounter.class?.code,
    serviceType: isEmpty(serviceType) ? undefined : serviceType,
    // The first reason: FHIR lets it repeat, Metriport sends one, and the
    // bundle is retained whole should a second ever matter.
    reason: textOf(encounter.reasonCode?.[0]),
    locations: referenced<Location, LocationRecord>(
      bundle,
      'Location',
      (encounter.location ?? []).map((entry) => ({
        reference: entry.location,
        encounter: {
          startedAt: entry.period?.start,
          endedAt: entry.period?.end,
        },
      })),
      locationFrom,
    ),
    practitioners: referenced<Practitioner, PractitionerRecord>(
      bundle,
      'Practitioner',
      (encounter.participant ?? []).map((entry) => ({
        reference: entry.individual,
        encounter: {
          role: firstCodeOf(entry.type),
          startedAt: entry.period?.start,
          endedAt: entry.period?.end,
        },
      })),
      practitionerFrom,
    ),
    conditions: referenced<Condition, ConditionRecord>(
      bundle,
      'Condition',
      (encounter.diagnosis ?? []).map((entry) => ({
        reference: entry.condition,
        encounter: { use: codeOf(entry.use), rank: entry.rank },
      })),
      conditionFrom,
    ),
  })
}
