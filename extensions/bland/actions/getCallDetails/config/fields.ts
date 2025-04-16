import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  callId: {
    id: 'callId',
    label: 'Call ID',
    description:
      'The identifier of the call for which you want to retrieve information.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  callId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
