import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty } from '@medplum/core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  messageDataPoint: {
    id: 'messageDataPoint',
    label: 'Message Data Point',
    description:
      'The message to parse. Use this if you want to use a data point for the message.',
    type: FieldType.STRING,
    required: false,
  },
  message: {
    id: 'message',
    label: 'Message',
    description:
      'The message to parse. Use this if you want to use a text for the message.',
    type: FieldType.TEXT,
    required: false,
  },
  schema: {
    id: 'schema',
    label: 'Schema',
    description:
      'JSON schema defining the structure to extract from the message. Example: {"name": "string", "age": "number", "email": "string"}',
    type: FieldType.JSON,
    required: true,
  },
  instructions: {
    id: 'instructions',
    label: 'Instructions',
    description: 'Add additional instructions prompt for the LLM',
    type: FieldType.TEXT,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  message: z.string().optional(),
  messageDataPoint: z.string().optional(),
  schema: z.string().transform((str, ctx): Record<string, string> => {
    if (isEmpty(str)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Schema is required',
      })
      return z.NEVER
    }

    try {
      const parsed = JSON.parse(str)
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Schema must be a JSON object',
        })
        return z.NEVER
      }
      return parsed as Record<string, string>
    } catch (e) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid JSON schema',
      })
      return z.NEVER
    }
  }),
  instructions: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
