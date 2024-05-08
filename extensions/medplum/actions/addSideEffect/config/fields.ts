import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  medicationRequestId: {
    id: 'medicationRequestId',
    label:
      'The ID of the medication request you want to link the side effec to',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  sideEffect: {
    id: 'sideEffect',
    label: 'Side effect',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  medicationRequestId: z.string().min(1),
  sideEffect: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
