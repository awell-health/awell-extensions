import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  list: {
    id: 'list',
    label: 'List',
    description: 'The list you want to transform to a comma separated text.',
    type: FieldType.STRING_ARRAY,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  list: z
    .unknown()
    .optional()
    .transform((val, ctx): string[] => {
      if (isNil(val) || isEmpty(val)) return []

      if (typeof val === 'string') {
        try {
          const parsedJson = JSON.parse(val)

          if (isEmpty(parsedJson)) {
            return []
          }

          if (!Array.isArray(parsedJson)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Not an array',
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
      }

      return val as string[]
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
