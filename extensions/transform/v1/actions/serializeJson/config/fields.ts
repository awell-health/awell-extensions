import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  json: {
    id: 'json',
    label: 'JSON',
    description: 'The data object you would like to stringify',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  json: z
    .string()
    .min(1)
    .trim()
    .transform((str, ctx): object => {
      if (isNil(str) || isEmpty(str)) {
        return {}
      }

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return {}
        }

        if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'JSON input is not a valid object',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
