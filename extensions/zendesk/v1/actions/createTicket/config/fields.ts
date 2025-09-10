import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  NumericIdSchema,
  makeStringOptional,
} from '@awell-health/extensions-core'

export const fields = {
  subject: {
    label: 'Subject',
    id: 'subject',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
    description: 'The subject line of the ticket.',
  },
  comment: {
    label: 'Comment',
    id: 'comment',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
    description: 'The initial comment/description for the ticket.',
  },
  group_id: {
    label: 'Group ID',
    id: 'group_id',
    type: FieldType.NUMERIC,
    required: false,
    description: 'The ID of the group to assign the ticket to.',
  },
  priority: {
    label: 'Priority',
    id: 'priority',
    type: FieldType.STRING,
    required: false,
    description: 'The priority level: urgent, high, normal, or low.',
  },
  external_id: {
    label: 'External ID',
    id: 'external_id',
    type: FieldType.STRING,
    required: false,
    description: 'An external identifier to link this ticket to your system.',
  },
  tag: {
    label: 'Tag',
    id: 'tag',
    type: FieldType.STRING,
    required: false,
    description: 'A tag to add to the ticket.',
  },
} satisfies Record<string, Field>

const priorityEnum = z.enum(['urgent', 'high', 'normal', 'low'])

export const FieldsValidationSchema = z.object({
  subject: z.string().nonempty(),
  comment: z.string().nonempty(),
  group_id: makeStringOptional(NumericIdSchema),
  priority: makeStringOptional(priorityEnum),
  external_id: z.string().optional(),
  tag: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
