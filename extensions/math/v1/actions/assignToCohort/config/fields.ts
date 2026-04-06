import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  input: {
    id: 'input',
    label: 'Input value',
    description:
      'Any string value used to determine the cohort assignment (e.g. patient ID, hash, email). The same input will always produce the same cohort.',
    required: true,
    type: FieldType.STRING,
  },
  numberOfCohorts: {
    id: 'numberOfCohorts',
    label: 'Number of cohorts',
    description:
      'The total number of cohorts to distribute inputs across. Must be an integer greater than or equal to 1.',
    required: true,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  input: z.string().min(1),
  numberOfCohorts: z.coerce.number().int().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
