import * as z from 'zod'
import { addressSchema, genderAtBirthSchema } from '@metriport/api'

export const patientCreateSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.string().length(10), // YYYY-MM-DD
    genderAtBirth: genderAtBirthSchema,
    driversLicenseState: z.string().optional(),
    driversLicenseValue: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  })
  .merge(addressSchema)

export type PatientCreate = z.infer<typeof patientCreateSchema>

export const patientUpdateSchema = z
  .object({
    id: z.string().min(1),
  })
  .merge(patientCreateSchema)
