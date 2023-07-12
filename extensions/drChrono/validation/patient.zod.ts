import { DateOnlySchema, NumericIdSchema } from '@awell-health/extensions-core'
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
    chart_id: NumericIdSchema.optional(),
    date_of_Birth: DateOnlySchema.optional(),
    email: z.string().email(),
    ethnicity: ethnicityEnum.optional(),
    first_name: z.string(),
    last_name: z.string(),
    preferred_language: preferredLanguageEnum.optional(),
    race: raceEnum.optional(),
    since: DateOnlySchema.optional(),
  })
  .strict()
