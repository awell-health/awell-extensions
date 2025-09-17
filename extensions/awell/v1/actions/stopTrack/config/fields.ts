import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  trackDefinitionId: {
    id: 'trackDefinitionId',
    label: 'Track definition ID',
    description: 'The definitionID of the track that you want to stop.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  trackDefinitionId: z.string().nonempty('Track definition ID is required'),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
