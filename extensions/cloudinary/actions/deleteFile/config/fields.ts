import { z, type ZodType } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  publicId: {
    id: 'publicId',
    label: 'Public ID',
    description:
      'The Cloudinary public ID of the asset to delete, e.g. the "publicId" data point returned by "Upload file from data point".',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  publicId: z.string().trim().min(1, { error: 'Public ID is required.' }),
} satisfies Record<keyof typeof fields, ZodType>)
