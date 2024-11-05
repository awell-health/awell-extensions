import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  healthiePatientId: {
    id: 'healthiePatientId',
    label: 'Healthie patient ID',
    description: 'The ID of the patient in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  healthieFormId: {
    id: 'healthieFormId',
    label: 'Healthie form ID',
    description: 'The ID of the form in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  freezeResponse: {
    id: 'freezeResponse',
    label: 'Freeze Response',
    description:
      'Indicates whether the form response should be frozen in Healthie.',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  healthiePatientId: z.string().min(1),
  healthieFormId: z.string().min(1),
  freezeResponse: z.boolean().default(false),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
