import {
  FieldType,
  NumericIdSchema,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient for whom the vitals are being retrieved',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
