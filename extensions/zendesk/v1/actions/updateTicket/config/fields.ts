import { z, type ZodType } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { isEmpty, isNil, uniq } from 'lodash'

const priorityEnum = z.enum(['urgent', 'high', 'normal', 'low'])
const statusEnum = z.enum([
  'new',
  'open',
  'pending',
  'hold',
  'solved',
  'closed',
])

export const fields = {
  ticket_id: {
    label: 'Ticket ID',
    id: 'ticket_id',
    type: FieldType.NUMERIC,
    required: true,
    description: 'The ID of the ticket to update.',
  },
  comment: {
    label: 'Comment',
    id: 'comment',
    type: FieldType.TEXT,
    required: false,
    description:
      'Add a comment to the ticket. Line breaks and blank lines are preserved. Markdown is rendered when the comment is posted by an agent.',
  },
  public: {
    label: 'Public comment',
    id: 'public',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'Whether the comment is visible to the requester. Defaults to No, which posts the comment as an internal note that only agents can see.',
  },
  priority: {
    label: 'Priority',
    id: 'priority',
    type: FieldType.STRING,
    required: false,
    description: 'The priority level: urgent, high, normal, or low.',
    options: {
      dropdownOptions: Object.values(priorityEnum.enum).map((priority) => ({
        label: priority,
        value: priority,
      })),
    },
  },
  status: {
    label: 'Status',
    id: 'status',
    type: FieldType.STRING,
    required: false,
    description: 'The status: new, open, pending, hold, solved, or closed.',
    options: {
      dropdownOptions: Object.values(statusEnum.enum).map((status) => ({
        label: status,
        value: status,
      })),
    },
  },
  tags: {
    label: 'Tags',
    id: 'tags',
    type: FieldType.STRING_ARRAY,
    required: false,
    description:
      'Replaces ALL tags on the ticket with this list. Enter comma-separated tags or select a list data point. Leave empty to keep the existing tags unchanged.',
  },
} satisfies Record<string, Field>

/**
 * Zendesk collapses consecutive newlines in a comment body into one, so blank
 * lines between paragraphs disappear. Zendesk's documented workaround is to
 * put a space on the empty line, which is what this does. Single line breaks
 * are preserved as-is.
 * https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_comments/#bodies
 */
export const preserveBlankLines = (body: string): string =>
  body.replace(/\r\n/g, '\n').replace(/\n(?=\n)/g, '\n ')

/**
 * Accepts the shapes a STRING_ARRAY field can arrive in: a JSON array string
 * (from a data point), a comma-separated string (typed in Studio), or an
 * actual array. Returns a de-duplicated list of trimmed, non-empty tags, or
 * `undefined` when there is nothing to set so the caller can omit `tags`.
 */
const TagsSchema = z
  .unknown()
  .optional()
  .transform((value, ctx): string[] | undefined => {
    if (isNil(value) || (typeof value === 'string' && isEmpty(value.trim())))
      return undefined

    let items: unknown[]

    if (Array.isArray(value)) {
      items = value
    } else if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.startsWith('[')) {
        try {
          const parsed: unknown = JSON.parse(trimmed)
          if (!Array.isArray(parsed)) {
            ctx.addIssue({ code: 'custom', message: 'Tags is not an array' })
            return z.NEVER
          }
          items = parsed
        } catch {
          ctx.addIssue({
            code: 'custom',
            message: 'Tags is not a valid JSON array',
          })
          return z.NEVER
        }
      } else {
        items = trimmed.split(',')
      }
    } else {
      ctx.addIssue({
        code: 'custom',
        message: 'Tags must be a list of strings or a comma-separated string',
      })
      return z.NEVER
    }

    const tags = uniq(
      items.map((item) => String(item).trim()).filter((tag) => tag.length > 0),
    )

    return tags.length === 0 ? undefined : tags
  })

export const FieldsValidationSchema = z.object({
  ticket_id: NumericIdSchema,
  comment: z.string().optional(),
  public: z.boolean().optional(),
  priority: makeStringOptional(priorityEnum),
  status: makeStringOptional(statusEnum),
  tags: TagsSchema,
} satisfies Record<keyof typeof fields, ZodType>)
