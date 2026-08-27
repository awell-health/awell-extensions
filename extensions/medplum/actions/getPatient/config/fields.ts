import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The identifier of the patient in Medplum',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: z.string().nonempty({
    error: 'Missing "Patient ID"',
  }),
} satisfies Record<keyof typeof fields, ZodType>)
