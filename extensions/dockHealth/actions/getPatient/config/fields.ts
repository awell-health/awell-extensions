import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  dockPatientId: {
    id: 'dockPatientId',
    label: 'Dock patient ID',
    description: 'Identifier of the patient in Dock Health',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  dockPatientId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
