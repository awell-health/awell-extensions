import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  data: {
    id: 'data',
    label: 'Data',
    description:
      'Paste example JSON here that mocks the data Stedi would return',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  data: z
    .string()
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return undefined
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON.' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
