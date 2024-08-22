import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  endpoint: {
    id: 'endpoint',
    label: 'Endpoint',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  headers: {
    id: 'headers',
    label: 'Headers',
    description: '',
    type: FieldType.JSON,
    required: false,
  },
  jsonPayload: {
    id: 'jsonPayload',
    label: 'JSON payload',
    description: '',
    type: FieldType.JSON,
    required: true,
  },
  additionalPayload: {
    id: 'additionalPayload',
    label: 'Additional payload',
    description:
      'The JSON payload and additional payload will be merged into a single payload',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  endpoint: z.string().min(1),
  headers: z
    .string()
    .trim()
    .optional()
    .transform((str, ctx): Record<string, string> => {
      if (isNil(str) || isEmpty(str)) {
        return {}
      }

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return {}
        }

        if (
          typeof parsedJson !== 'object' ||
          Array.isArray(parsedJson) ||
          Object.values(parsedJson).some((value) => typeof value !== 'string')
        ) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Headers must be a key-value object where each value is a string',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
  jsonPayload: z
    .string()
    .trim()
    .transform((str, ctx): Record<string, unknown> => {
      if (isNil(str) || isEmpty(str)) {
        return {}
      }

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return {}
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
  additionalPayload: z
    .string()
    .trim()
    .optional()
    .transform((str, ctx): Record<string, unknown> => {
      if (isNil(str) || isEmpty(str)) {
        return {}
      }

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return {}
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
