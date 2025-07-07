import { FieldType, type Field } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  ticketId: {
    id: 'ticketId',
    label: 'Ticket ID',
    description: 'The ID of the ticket to update',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'Content of the note in HTML',
    type: FieldType.HTML,
    required: true,
  },
  incoming: {
    id: 'incoming',
    label: 'Incoming',
    description:
      'Set to true if a particular note should appear as being created from outside (i.e., not through web portal). The default value is false',
    type: FieldType.BOOLEAN,
    required: false,
  },
  notifyEmails: {
    id: 'notifyEmails',
    label: 'Notify emails',
    description: `Comma separated list of email addresses of agents/users who need to be notified about this note`,
    type: FieldType.STRING,
    required: false,
  },
  private: {
    id: 'private',
    label: 'Private',
    description: `Set to true if the note is private. The default value is true.`,
    type: FieldType.BOOLEAN,
    required: false,
  },
  userId: {
    id: 'userId',
    label: 'User ID',
    description: 'ID of the agent/user who is adding the note',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1),
  incoming: z.boolean().optional(),
  notifyEmails: z
    .string()
    .optional()
    .transform((val) => {
      if (isNil(val) || isEmpty(val)) return undefined

      return val
        .trim()
        .split(',')
        .map((tag) => tag.trim())
    }),
  private: z.boolean().optional(),
  userId: z.coerce.number().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
