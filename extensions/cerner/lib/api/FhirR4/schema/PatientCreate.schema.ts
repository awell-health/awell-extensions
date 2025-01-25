import { type Patient } from '@medplum/fhirtypes'

/**
 * This is probably imperfect as Medplum's FHIR type might
 * not be fully compatible with Epic's FHIR type but good enough for now
 */
export type PatientCreateInputType = Partial<Patient>

export type PatientCreateResponseType = Patient
