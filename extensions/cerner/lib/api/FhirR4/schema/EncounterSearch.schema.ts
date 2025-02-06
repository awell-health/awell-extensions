import { type Encounter, type Bundle } from '@medplum/fhirtypes'

/**
 * Search supports more fields but we only need MRN for now
 */
export interface EncounterSearchInputType {
  patientResourceId: string
}

export type EncounterSearchResponseType = Bundle<Encounter>
