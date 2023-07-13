import {
  DateOnlySchema,
  makeStringOptional,
  NumericIdSchema,
} from '@awell-health/extensions-core'
import { z } from 'zod'

// Enums
const genderEnum = z.enum(['male', 'female', 'other'])

const ethnicityEnum = z.enum(['blank', 'hispanic', 'not_hispanic', 'declined'])

const raceEnum = z.enum([
  'blank',
  'indian',
  'asian',
  'black',
  'hawaiian',
  'white',
  'declined',
])
const preferredLanguageEnum = z.enum([
  'blank',
  'eng',
  'zho',
  'fra',
  'ita',
  'jpn',
  'por',
  'rus',
  'spa',
  'other',
  'unknown',
  'declined',
])

// Schemas
export const patientSchema = z
  .object({
    doctor: NumericIdSchema,
    gender: genderEnum,
    chart_id: makeStringOptional(z.string()),
    date_of_birth: makeStringOptional(DateOnlySchema),
    email: makeStringOptional(z.string().email()),
    ethnicity: makeStringOptional(ethnicityEnum),
    first_name: makeStringOptional(z.string()),
    last_name: makeStringOptional(z.string()),
    preferred_language: makeStringOptional(preferredLanguageEnum),
    race: makeStringOptional(raceEnum),
  })
  .strict()

export const patchPatientSchema = patientSchema.extend({
  doctor: makeStringOptional(NumericIdSchema),
  gender: makeStringOptional(genderEnum),
})
