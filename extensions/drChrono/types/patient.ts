import { type z } from 'zod'
import { type patientSchema } from '../validation/patient.zod'

export type PatientInput = z.infer<typeof patientSchema>

/**
 * There is a difference between `input` and `output` objects in DrChrono,
 * some fields are readonly (not in input), some have different structure
 */
export interface PatientResponse extends PatientInput {
  id: number
  address: string
  city: string
  zip_code: string
  cell_phone: string
  created_at: string
  updated_at: string
}
