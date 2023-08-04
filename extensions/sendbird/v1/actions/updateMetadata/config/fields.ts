import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { MetadataValidationSchema } from '../../../validation'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "A user's unique ID.",
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description:
      'Specifies a JSON object to store up to five key-value items for additional user information such as a phone number, an email address, or a long description of the user. The key must not have a comma (,) and its length is limited to 128 characters. The value must be a string and its length is limited to 190 characters.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  metadata: MetadataValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
