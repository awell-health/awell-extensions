import z from 'zod'
import { AthenaDateOnlySchema } from './date'

export interface CreatePatientResponseType {
  patientid: string
}

export const PatientSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  dob: AthenaDateOnlySchema,
  email: z.string(),
  departmentid: z.string(),
  primarydepartmentid: z.string(),
  patientid: z.string(),
  registrationdate: AthenaDateOnlySchema,
  lastupdated: AthenaDateOnlySchema,
  driverslicense: z.boolean(),
  status: z.string(),
})

export type PatientSchemaType = z.infer<typeof PatientSchema>
