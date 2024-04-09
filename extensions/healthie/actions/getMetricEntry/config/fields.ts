import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the patient in Healthie you would like to retrieve the metric for',
    type: FieldType.STRING,
    required: true,
  },
  category: {
    id: 'category',
    label: 'Category',
    description: 'Specifies the metric you would like to retrieve',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string().nonempty(),
  category: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
