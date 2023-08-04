import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  userId: {
    label: 'User ID',
    id: 'userId',
    type: FieldType.STRING,
    required: true,
    description: "A user's unique ID.",
  },
  metadataKey: {
    label: 'Metadata key',
    id: 'metadataKey',
    type: FieldType.STRING,
    required: false,
    description:
      'Specifies the key of a metadata item. If not specified, all items of the metadata are deleted.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userId: z.string().nonempty(),
  metadataKey: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
