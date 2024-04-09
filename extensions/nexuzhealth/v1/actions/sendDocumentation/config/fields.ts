import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  documentationId: {
    id: 'documentationId',
    label: 'Documentation',
    type: FieldType.STRING,
    description: 'Selecteer de documentatie die je beschikbaar wil maken',
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  documentationId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
