import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty } from '@medplum/core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  imageUrl: {
    id: 'imageUrl',
    label: 'Image URL',
    description: 'The URL to the uploaded image',
    type: FieldType.STRING,
    required: true,
  },
  medicationData: {
    id: 'medicationData',
    label: 'Medication data',
    description: 'The medication data to review',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  imageUrl: z.string().url(),
  medicationData: z.string().transform((str, ctx): Record<string, unknown> => {
    if (isEmpty(str)) return {}

    try {
      return JSON.parse(str)
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
