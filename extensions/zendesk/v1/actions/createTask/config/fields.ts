import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  DateTimeOptionalSchema,
  NumericIdSchema,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { ResourceType } from '../../../client/types'

export const fields = {
  content: {
    label: 'Content',
    id: 'content',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
    description: 'Content of the task.',
  },
  dueDate: {
    label: 'Due date',
    id: 'dueDate',
    // STRING because FieldType.DATE doesn't allow setting time
    type: FieldType.STRING,
    required: false,
    description: "Date and time of task's due date in UTC (ISO8601 format).",
  },
  ownerId: {
    label: 'Owner ID',
    id: 'ownerId',
    type: FieldType.NUMERIC,
    required: false,
    description:
      'Unique identifier of the user the task is assigned to. Defaults to the unique identifier of the user who created the task.',
  },
  resourceType: {
    label: 'Resource type',
    id: 'resourceType',
    type: FieldType.STRING,
    required: false,
    description:
      'Name of the resource type the task is attached to. Possible values: "lead", "contact", "deal".',
  },
  resourceId: {
    label: 'Resource ID',
    id: 'resourceId',
    type: FieldType.NUMERIC,
    required: false,
    description: 'Unique identifier of the resource the task is attached to.',
  },
  completed: {
    label: 'Completed?',
    id: 'completed',
    type: FieldType.BOOLEAN,
    required: false,
    description: 'Indicator of whether the task is completed or not.',
  },
  remindAt: {
    label: 'Remind at',
    id: 'remindAt',
    // STRING because FieldType.DATE doesn't allow setting time
    type: FieldType.STRING,
    required: false,
    description:
      'Date and time that we should send you a reminder about the task in UTC (ISO8601 format).',
  },
} satisfies Record<string, Field>

const resourceTypeEnum = z.enum<
  ResourceType,
  [ResourceType, ...ResourceType[]]
>(Object.values(ResourceType) as [ResourceType, ...ResourceType[]])

export const FieldsValidationSchema = z.object({
  content: z.string().nonempty(),
  dueDate: DateTimeOptionalSchema,
  ownerId: NumericIdSchema,
  resourceType: makeStringOptional(resourceTypeEnum),
  resourceId: makeStringOptional(NumericIdSchema),
  completed: z.boolean().optional(),
  remindAt: DateTimeOptionalSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
