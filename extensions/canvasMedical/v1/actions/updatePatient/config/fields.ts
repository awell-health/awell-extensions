import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  patientData: {
    id: 'patientData',
    label: 'Patient data',
    description: 'Patient data',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  patientData: z.string().nonempty({
    error: 'Missing "Patient data"',
  }),
} satisfies Record<keyof typeof fields, ZodType>)
