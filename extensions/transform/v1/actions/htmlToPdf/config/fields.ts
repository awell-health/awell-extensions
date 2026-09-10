import { z, type ZodType } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  htmlString: {
    id: 'htmlString',
    label: 'HTML string',
    description: 'The HTML string to convert to a PDF.',
    type: FieldType.STRING,
    required: true,
  },
  options: {
    id: 'options',
    label: 'Options',
    description:
      'The options for the PDF. See https://pptr.dev/api/puppeteer.pdfoptions',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

/**
 * Awell delivers JSON fields to the extension as a string. Parse it so the
 * options object is forwarded to the PDF server as an object. Objects are
 * accepted as-is so existing callers and tests keep working.
 */
const OptionsSchema = z
  .union([z.string(), z.record(z.string(), z.any())])
  .optional()
  .transform((value, ctx): Record<string, unknown> | undefined => {
    if (isNil(value)) return undefined
    if (typeof value !== 'string') return value

    const trimmed = value.trim()
    if (isEmpty(trimmed)) return undefined

    try {
      const parsed = JSON.parse(trimmed)
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Options must be a JSON object',
        })
        return z.NEVER
      }
      return parsed
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Options is not valid JSON',
      })
      return z.NEVER
    }
  })

export const FieldsValidationSchema = z.object({
  htmlString: z.string().min(1),
  options: OptionsSchema,
} satisfies Record<keyof typeof fields, ZodType>)
