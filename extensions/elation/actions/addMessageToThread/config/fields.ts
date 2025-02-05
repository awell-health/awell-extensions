import {
  FieldType,
  NumericIdSchema,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  threadId: {
    id: 'threadId',
    label: 'Thread ID',
    description:
      'The ID of the message thread to which the message will be added',
    type: FieldType.NUMERIC,
    required: true,
  },
  senderId: {
    id: 'senderId',
    label: 'Sender ID',
    description: 'The ID of the user that adds the message to the thread',
    type: FieldType.NUMERIC,
    required: true,
  },
  messageBody: {
    id: 'messageBody',
    label: 'Message Body',
    description: 'The content of the message to be added to the thread',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  threadId: NumericIdSchema,
  senderId: NumericIdSchema,
  messageBody: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
