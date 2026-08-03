import * as z from 'zod'
import { DateOnlySchema } from '@awell-health/extensions-core'
import { optionalEmailSchema } from '../../../../src/utils/emailValidation'
import {
  genderAtBirthSchema,
  usStateForAddressSchema,
} from '@metriport/api-sdk'

/**
 * Awell stores a patient's sex as `Male`, `Female` or `Unknown` while Metriport
 * expects a single letter code (`M`, `F`, `O`, `U`). Anything already in
 * Metriport's format is passed through untouched; anything we don't recognise
 * is left alone so Metriport's schema rejects it, surfacing the bad patient
 * data rather than quietly recording the sex as unknown.
 */
const genderAtBirthAliases: Record<
  string,
  z.infer<typeof genderAtBirthSchema>
> = {
  m: 'M',
  male: 'M',
  f: 'F',
  female: 'F',
  o: 'O',
  other: 'O',
  u: 'U',
  unknown: 'U',
  not_known: 'U',
}

export const genderAtBirthTransformSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value

  return genderAtBirthAliases[value.trim().toLowerCase()] ?? value
}, genderAtBirthSchema)

export const patientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  /**
   * Metriport expects a date-only string (YYYY-MM-DD). `DateOnlySchema`
   * normalises whatever the DATE field hands over — a plain `1940-08-29` or a
   * full ISO timestamp — down to the date part.
   */
  dob: DateOnlySchema,
  genderAtBirth: genderAtBirthTransformSchema,
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
  cohort: z.string().optional(),
})

export type PatientCreate = z.infer<typeof patientCreateSchema>

export const patientUpdateSchema = z
  .object({
    id: z.string().min(1),
  })
  .merge(patientCreateSchema)
