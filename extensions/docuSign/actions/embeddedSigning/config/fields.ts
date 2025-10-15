import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  signUrl: {
    id: 'signUrl',
    label: 'Sign URL',
    description:
      'Enter the sign URL generated via the "Create embedded signature request with template" action',
    type: FieldType.STRING,
    required: true,
  },
  webhook: {
    id: 'webhook',
    label: 'Webhook URL',
    description:
      'Webhook URL for async completion. If provided, activity will not complete until DocuSign sends completion webhook. The activity_id will be automatically appended as a query parameter.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  signUrl: z.string().url(),
  webhook: z.string().url().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
