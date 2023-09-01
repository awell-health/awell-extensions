import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "The user's unique ID in Sendbird.",
  },
  metadataKey: {
    label: 'Metadata key',
    id: 'metadataKey',
    type: FieldType.STRING,
    required: false,
    description:
      'The key of the metadata item to delete. If not specified, all items of the metadata are deleted.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  metadataKey: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
