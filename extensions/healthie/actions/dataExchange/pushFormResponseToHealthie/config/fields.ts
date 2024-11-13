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
  lockFormAnswerGroup: {
    id: 'lockFormAnswerGroup',
    label: 'Lock form answer group',
    description: 'Locking the form will stop any further editing',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  healthiePatientId: z.string().min(1),
  healthieFormId: z.string().min(1),
  lockFormAnswerGroup: z.boolean().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
