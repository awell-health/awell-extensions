import { type Patient, type Bundle } from '@medplum/fhirtypes'

/**
 * Search supports more fields but we only need MRN for now
 */
export interface PatientSearchInputType {
  MRN: string
}

export type PatientSearchResponseType = Bundle<Patient>
