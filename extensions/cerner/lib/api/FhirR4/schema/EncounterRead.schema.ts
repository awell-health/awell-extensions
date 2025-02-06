import { z } from 'zod'
import { type Encounter } from '@medplum/fhirtypes'

export const EncounterReadInputSchema = z.string()

export type EncounterReadInputType = z.infer<typeof EncounterReadInputSchema>

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type EncounterReadResponseType = Encounter
