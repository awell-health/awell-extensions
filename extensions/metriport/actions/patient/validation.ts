import * as z from 'zod'
import { DateOnlySchema } from '@awell-health/extensions-core'
import { optionalEmailSchema } from '../../../../src/utils/emailValidation'
import {
  genderAtBirthSchema,
  usStateForAddressSchema,
} from '@metriport/api-sdk'

/**
 * Awell stores a patient's sex as free text (e.g. `Male`, `Female`,
 * `Non-Binary`) while Metriport expects a single letter code (`M`, `F`, `O`,
 * `U`). Anything that maps to `M` or `F` is recognised explicitly, as is
 * anything that explicitly spells out "unknown". Every other given value
 * (including things we've never seen, like `Non-Binary`) becomes `O` rather
 * than being rejected. `U` is otherwise reserved for when no value was given
 * at all.
 */
const genderAtBirthAliases: Record<
  string,
  z.infer<typeof genderAtBirthSchema>
> = {
  m: 'M',
  male: 'M',
  man: 'M',
  f: 'F',
  female: 'F',
  woman: 'F',
  o: 'O',
  other: 'O',
  u: 'U',
  unknown: 'U',
  not_known: 'U',
}

export const genderAtBirthTransformSchema = z.preprocess((value) => {
  if (value === undefined || value === null) return 'U'
  if (typeof value !== 'string') return value

  const normalized = value.trim().toLowerCase()
  if (normalized === '') return 'U'

  return genderAtBirthAliases[normalized] ?? 'O'
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
})

export type PatientCreate = z.infer<typeof patientCreateSchema>

export const patientUpdateSchema = z
  .object({
    id: z.string().min(1),
  })
  .merge(patientCreateSchema)
