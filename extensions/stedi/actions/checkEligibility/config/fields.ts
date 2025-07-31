import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  data: {
    id: 'data',
    label: 'Data',
    description:
      'Paste example JSON here that mocks the data Stedi would return',
    type: FieldType.STRING, // JSON doesn't work reliably with the agent
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  data: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
