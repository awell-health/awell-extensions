import * as z from 'zod'
import { optionalEmailSchema } from '../../../../src/utils/emailValidation'
import {
  genderAtBirthSchema,
  addressSchema,
  usStateForAddressSchema,
} from '@metriport/api-sdk'

export const patientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().length(10),
  genderAtBirth: genderAtBirthSchema,
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: usStateForAddressSchema,
  zip: z.string().min(1),
  country: z.literal('USA').default('USA'),
  driversLicenseState: z.string().optional(),
  driversLicenseValue: z.string().optional(),
  phone: z.string().optional(),
  email: optionalEmailSchema,
})

export type PatientCreate = z.infer<typeof patientCreateSchema>

export const patientUpdateSchema = z
  .object({
    id: z.string().min(1),
  })
  .merge(patientCreateSchema)
