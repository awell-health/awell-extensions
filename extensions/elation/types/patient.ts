import { type z } from 'zod'
import {
  type patientStatusSchema,
  type patientSchema,
  type insuranceSchema,
  type guarantorSchema,
  type phoneSchema,
  type emailSchema
} from "../validation/patient.zod"

export type CreateUpdatePatient = z.infer<typeof patientSchema>

export interface Patient extends Omit<CreateUpdatePatient, 'dob'> {
  id: number
  dob: string
  primary_care_provider?: number | null
  phones?: Phone[]
  emails?: Email[]
  guarantor?: Guarantor | null
  insurances?: Insurance[]
  deleted_insurances?: Insurance[]
  patient_status: PatientStatus
  consents?: Consent[]
  created_date: string
  deleted_date?: string | null
  merged_into_chart?: number | null
}

interface Phone extends z.infer<typeof phoneSchema> {
  created_date: string
  deleted_date?: string | null
}
interface Email extends z.infer<typeof emailSchema> {
  created_date: string
  deleted_date?: string | null
}
interface Guarantor extends z.infer<typeof guarantorSchema> {
  id: number
}

interface Insurance extends z.infer<typeof insuranceSchema> {
  id: number
  insurance_company: number
  insurance_plan: number
  created_date: string
  deleted_date?: string | null
}
interface PatientStatus extends z.infer<typeof patientStatusSchema> {
  last_status_change?: string | null
}
interface Consent {
  consented: boolean
  last_modified_date: string
  application: string
}
