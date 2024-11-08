import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone number',
    description: '',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  task: {
    id: 'task',
    label: 'Task',
    description:
      'Provide instructions, relevant information, and examples of the ideal conversation flow.',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  phoneNumber: z.string().min(1),
  task: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
