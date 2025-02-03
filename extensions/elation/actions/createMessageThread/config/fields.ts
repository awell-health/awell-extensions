import {
  DateTimeSchema,
  FieldType,
  NumericIdSchema,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient chart for which the thread is about',
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
    description: 'Date associated with the document (ISO format)',
    type: FieldType.DATE,
    required: true,
  },
  chartDate: {
    id: 'chartDate',
    label: 'Chart Date',
    description: 'Date of the patient’s chart (ISO format)',
    type: FieldType.DATE,
    required: true,
  },
  messageBody: {
    id: 'messageBody',
    label: 'Message Body',
    description: 'The content of the initial message in the thread',
    type: FieldType.STRING,
    required: true,
  },
  groupId: {
    id: 'groupId',
    label: 'Group ID',
    description: 'The ID of the group to which the thread member belongs',
    type: FieldType.NUMERIC,
    required: false,
  },
  isUrgent: {
    id: 'isUrgent',
    label: 'Urgent',
    description: 'Marks the message thread as urgent if true',
    type: FieldType.BOOLEAN,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  patientId: NumericIdSchema,
  senderId: NumericIdSchema,
  practiceId: NumericIdSchema,
  documentDate: DateTimeSchema,
  chartDate: DateTimeSchema,
  messageBody: z.string().min(1),
  groupId: NumericIdSchema.optional(),
  isUrgent: z.boolean(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
