import { z } from 'zod'
import {
  DateOnlyOptionalSchema,
  E164PhoneValidationOptionalSchema,
} from '@awell-health/extensions-core'
import { GenderSchema } from '../../../../../src/lib/fhir/schemas/Patient'
import { optionalEmailSchema } from '../../../../../src/utils/emailValidation'

export const PatientSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: optionalEmailSchema,
  mobilePhone: E164PhoneValidationOptionalSchema,
  birthDate: DateOnlyOptionalSchema,
  gender: GenderSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
})
