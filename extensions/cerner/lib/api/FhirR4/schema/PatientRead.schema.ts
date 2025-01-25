import { z } from 'zod'
import { type Patient } from '@medplum/fhirtypes'

export const PatientReadInputSchema = z.string()

export type PatientReadInputType = z.infer<typeof PatientReadInputSchema>

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type PatientReadResponseType = Patient
