import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

const LanguageEnum = z.enum(['English', 'Dutch', 'French'])
export type OutputLanguageType = z.infer<typeof LanguageEnum>

const dropdownOptionsBoolean = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const dropdownOptionsBooleanSchema = z
  .enum(['true', 'false'])
  .transform((val) => val === 'true')

export const fields = {
  language: {
    id: 'language',
    label: 'Language',
    description: 'The language the output should be in. Default is English.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(LanguageEnum.enum).map((language) => ({
        label: language,
        value: language,
      })),
    },
  },
  includeDescriptions: {
    id: 'includeDescriptions',
    label: 'Include descriptions',
    description:
      'Should descriptions be included in the output? Default is "Yes".',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  includeMissingAnswers: {
    id: 'includeMissingAnswers',
    label: 'Include missing answers',
    description:
      'Should missing or unanswered questions be included in the output? Default is "Yes".',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  separator: {
    id: 'separator',
    label: 'Separator',
    description:
      'The separator to use between questions. If not provided, the question and answers will be separated by a blank line.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  language: LanguageEnum.default('English'),
  includeDescriptions: dropdownOptionsBooleanSchema.default('true'),
  includeMissingAnswers: dropdownOptionsBooleanSchema.default('true'),
  separator: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
