import {
  DateTimeOptionalSchema,
  FieldType,
  NumericIdSchema,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient for which the thread is about',
    type: FieldType.NUMERIC,
    required: true,
  },
  senderId: {
    id: 'senderId',
    label: 'Sender ID',
    description: 'The ID of the user initiating the message thread',
    type: FieldType.NUMERIC,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    description: 'The practice associated with the patient chart',
    type: FieldType.NUMERIC,
    required: true,
  },
  documentDate: {
    id: 'documentDate',
    label: 'Document Date',
    description: 'Defaults to today’s date if not provided',
    type: FieldType.DATE,
    required: false,
  },
  chartDate: {
    id: 'chartDate',
    label: 'Chart Date',
    description: 'Defaults to today’s date if not provided',
    type: FieldType.DATE,
    required: false,
  },
  messageBody: {
    id: 'messageBody',
    label: 'Message Body',
    description: 'The content of the initial message in the thread',
    type: FieldType.STRING,
    required: true,
  },
  recipientId: {
    id: 'recipientId',
    label: 'Recipient ID',
    description:
      'A user ID of the recipient of the message. They will be added as a member to the thread.',
    type: FieldType.NUMERIC,
    required: false,
  },
  groupId: {
    id: 'groupId',
    label: 'Group ID',
    description:
      'The ID of a group that will be added as a member to the thread.',
    type: FieldType.NUMERIC,
    required: false,
  },
  isUrgent: {
    id: 'isUrgent',
    label: 'Urgent',
    description:
      'Marks the message thread as urgent if true. Defaults to false.',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  senderId: NumericIdSchema,
  practiceId: NumericIdSchema,
  documentDate: z
    .string()
    .optional()
    .default(new Date().toISOString())
    .pipe(DateTimeOptionalSchema),
  chartDate: z
    .string()
    .optional()
    .default(new Date().toISOString())
    .pipe(DateTimeOptionalSchema),
  messageBody: z.string().min(1),
  recipientId: NumericIdSchema.optional(),
  groupId: NumericIdSchema.optional(),
  isUrgent: z.boolean().optional().default(false),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
