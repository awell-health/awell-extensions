import { FieldType, type Field } from '@awell-health/extensions-core'
import {
  TicketStatus,
  TicketPriority,
  TicketPriorityDescriptionString,
  TicketStatusDescriptionString,
  TicketStatusSchema,
  TicketPrioritySchema,
} from '../../../lib/api/schema/atoms'
import z, { type ZodTypeAny } from 'zod'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  ticketId: {
    id: 'ticketId',
    label: 'Ticket ID',
    description: 'The ID of the ticket to update',
    type: FieldType.STRING,
    required: true,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'Subject of the ticket',
    type: FieldType.STRING,
    required: false,
  },
  type: {
    id: 'type',
    label: 'Type',
    description:
      'Helps categorize the ticket according to the different kinds of issues your support team deals with',
    type: FieldType.STRING,
    required: false,
  },
  status: {
    id: 'status',
    label: 'Status',
    description: `The status of the ticket. Possible values: ${TicketStatusDescriptionString}`,
    type: FieldType.NUMERIC,
    required: false,
    options: {
      dropdownOptions: Object.entries(TicketStatus).map(([key, value]) => ({
        label: key,
        value,
      })),
    },
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    description: `The priority of the ticket. Possible values: ${TicketPriorityDescriptionString}`,
    type: FieldType.NUMERIC,
    required: false,
    options: {
      dropdownOptions: Object.entries(TicketPriority).map(([key, value]) => ({
        label: key,
        value,
      })),
    },
  },
  description: {
    id: 'description',
    label: 'Description',
    description: 'Content of the ticket',
    type: FieldType.HTML,
    required: false,
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description:
      'Key value pairs containing the names and values of custom fields. All values must be strings.',
    type: FieldType.JSON,
    required: false,
  },
  dueBy: {
    id: 'dueBy',
    label: 'Due by',
    description: 'Timestamp that denotes when the ticket is due to be resolved',
    type: FieldType.DATE,
    required: false,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description: 'Comma separated list of tags to associate with the ticket.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const NonEmptyStringSchema = z
  .string()
  .transform((val) => (val === '' ? undefined : val))

export const FieldsValidationSchema = z.object({
  ticketId: z.string().min(1),
  subject: NonEmptyStringSchema.optional(),
  type: NonEmptyStringSchema.optional(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  description: NonEmptyStringSchema.optional(),
  dueBy: NonEmptyStringSchema.optional(),
  tags: NonEmptyStringSchema.optional().transform((val) => {
    if (isNil(val) || isEmpty(val)) return undefined

    return val
      .trim()
      .split(',')
      .map((tag) => tag.trim())
  }),
  customFields: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, string> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        const allValuesAreStrings = Object.values(parsedJson).every(
          (value) => typeof value === 'string',
        )

        if (!allValuesAreStrings) {
          ctx.addIssue({
            code: 'custom',
            message: 'All values for custom fields must be strings',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          message: 'Not a valid JSON object',
        })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
