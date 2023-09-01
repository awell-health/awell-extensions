import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { MetadataValidationSchema } from '../../../validation'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "The user's unique ID in Sendbird.",
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description:
      'A JSON object that can store up to five key-value items for additional user information.',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  metadata: MetadataValidationSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
