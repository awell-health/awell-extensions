import { type Store } from '@awell-health/extensions-core'
import { metriportIdentifierSystem } from '../../shared/identifierSystem'
import { type AdtRecord } from './schemas'

/** The Encounter's side of each relationship, once both ends exist in Awell. */
export interface EncounterLinks {
  locations?: object[]
  participants?: object[]
  diagnoses?: object[]
}

/**
 * Saves one kind of resource and hands back the Encounter's links to them.
 *
 * Each is keyed on Metriport's own resource id, so a redelivered notification
 * upserts rather than duplicating and every message about a visit converges on
 * one of each. `metriportId` and `encounter` are the record's own scaffolding —
 * the key to save under and what the Encounter says about the resource — so
 * neither is written onto the resource itself.
 */
const saveEach = <T extends { metriportId: string; encounter?: object }>(
  store: Store,
  name: string,
  resources: T[] | undefined,
  link: (id: string, encounter: NonNullable<T['encounter']>) => object,
): object[] | undefined =>
  resources?.map(({ metriportId, encounter, ...data }) => {
    const { id } = store.save(name, {
      identifier: {
        system: metriportIdentifierSystem(name),
        value: metriportId,
      },
      ...data,
    })
    return link(id, encounter ?? {})
  })

/**
 * Writes everything the Encounter points at, before the Encounter itself.
 *
 * The Encounter is the hub — it holds every link — and a link needs the Awell
 * id a save hands back, which fixes the order. A message whose bundle carries
 * none of a kind gets `undefined` rather than an empty list, so the Encounter
 * save omits that field and never clears what an earlier message recorded.
 */
export const saveLinkedResources = (
  store: Store,
  record: AdtRecord,
): EncounterLinks => ({
  locations: saveEach(
    store,
    'Location',
    record.locations,
    (locationId, stay) => ({
      locationId,
      ...stay,
    }),
  ),
  participants: saveEach(
    store,
    'Practitioner',
    record.practitioners,
    (practitionerId, participation) => ({ practitionerId, ...participation }),
  ),
  diagnoses: saveEach(
    store,
    'Condition',
    record.conditions,
    (conditionId, diagnosis) => ({ conditionId, ...diagnosis }),
  ),
})
