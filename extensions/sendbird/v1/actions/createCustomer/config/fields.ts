import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  sendbirdId: {
    label: 'Sendbird ID',
    id: 'sendbirdId',
    type: FieldType.STRING,
    required: true,
    description:
      'The Sendbird ID of a customer which must be an ID that already exists in Sendbird (eg: user id).',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  sendbirdId: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
