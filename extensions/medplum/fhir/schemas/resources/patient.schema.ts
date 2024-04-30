import { z } from 'zod'
import {
  DateOnlyOptionalSchema,
  E164PhoneValidationOptionalSchema,
} from '@awell-health/extensions-core'

const fhirGenderSchema = z.union([
  z.literal('male'),
  z.literal('female'),
  z.literal('other'),
  z.literal('unknown'),
])

export const PatientSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  mobilePhone: E164PhoneValidationOptionalSchema,
  birthDate: DateOnlyOptionalSchema,
  gender: fhirGenderSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
})
