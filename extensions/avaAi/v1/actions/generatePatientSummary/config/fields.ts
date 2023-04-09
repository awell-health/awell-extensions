import { type Field, FieldType } from '../../../../../../lib/types'
import { z, type ZodTypeAny } from 'zod'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  characteristics: {
    id: 'characteristics',
    label: 'Characteristics to include in summary',
    description:
      'A comma-separated list of patient characteristics you would like to include in the summary (eg: first_name, last_name, birth_date). If left blank, all patient profile characteristics will be included.',
    type: FieldType.STRING,
    required: false,
  },
  language: {
    id: 'language',
    label: 'Language of the summary',
    description:
      'The language the summary will be written in. Defaults to "English"',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  characteristics: z.optional(
    z
      .string()
      // Make sure all white spaces are stripped
      .transform((chars) => chars.replace(/\s/g, ''))
      .transform((chars) => chars.split(','))
      // Make sure there are no undefined or empty characteristics
      .transform((charsArray) =>
        charsArray.filter((chars) => {
          if (isNil(chars) || isEmpty(chars)) return false

          return true
        })
      )
  ),
  language: z.optional(z.string()).transform((lang) => {
    if (isNil(lang) || isEmpty(lang)) return 'English'

    return lang
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
