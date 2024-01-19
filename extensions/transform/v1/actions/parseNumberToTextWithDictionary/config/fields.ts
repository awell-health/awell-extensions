import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  number: {
    id: 'number',
    label: 'Number',
    description: 'The number you want to parse to a text (string)',
    type: FieldType.NUMERIC,
    required: true,
  },
  dictionary: {
    id: 'dictionary',
    label: 'Dictionary',
    description:
      'A JSON dictionary where each string key represents a number and maps to a corresponding string/text value',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

export const DictionarySchema = z
  .string()
  .transform((dict, ctx): Record<string, any> => {
    if (isNil(dict) || isEmpty(dict)) return {}
    try {
      return JSON.parse(dict)
    } catch (e) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Invalid dictionary. Must be a valid key-value pair JSON object.',
      })
      return z.NEVER
    }
  })

export const FieldsValidationSchema = z.object({
  number: z.union([z.number(), z.nan()]),
  dictionary: DictionarySchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
