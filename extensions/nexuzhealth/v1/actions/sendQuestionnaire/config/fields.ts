import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  questionnaireId: {
    id: 'questionnaireId',
    label: 'Vragenlijst',
    type: FieldType.STRING,
    description: 'Selecteer de vragenlijst die de patiënt moet invullen',
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  questionnaireId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
