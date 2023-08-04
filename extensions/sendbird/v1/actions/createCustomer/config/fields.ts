import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  sendbirdId: {
    label: 'Sendbird ID',
    id: 'sendbirdId',
    type: FieldType.STRING,
    required: true,
    description:
      'Specifies the Sendbird ID of a customer. Must be an ID that already exists in Sendbird Chat platform ("User ID" for example).',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  sendbirdId: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
