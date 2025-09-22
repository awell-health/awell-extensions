import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  trackDefinitionId: {
    id: 'trackDefinitionId',
    label: 'Track definition ID',
    description:
      'The definition ID of the track to check enrollment status for.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  trackDefinitionId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
