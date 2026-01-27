import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

const LanguageEnum = z.enum(['English', 'Dutch', 'French'])
export type OutputLanguageType = z.infer<typeof LanguageEnum>

const ScopeEnum = z.enum(['Step', 'Track'])
export type ScopeType = z.infer<typeof ScopeEnum>

const FormSelectionEnum = z.enum(['Latest', 'All'])
export type FormSelectionType = z.infer<typeof FormSelectionEnum>

export const fields = {
  scope: {
    id: 'scope',
    label: 'Scope',
    description:
      'The scope in which to look for forms. Default is "Step" (current step only).',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(ScopeEnum.enum).map((scope) => ({
        label: scope,
        value: scope,
      })),
    },
  },
  formSelection: {
    id: 'formSelection',
    label: 'Form selection',
    description:
      'Whether to capture the most recent form or all forms in the scope. Default is "Latest". Form headers will be included if "All" is selected.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: Object.values(FormSelectionEnum.enum).map(
        (selection) => ({
          label: selection,
          value: selection,
        }),
      ),
    },
  },
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
    type: FieldType.BOOLEAN,
    required: false,
  },
  includeMissingAnswers: {
    id: 'includeMissingAnswers',
    label: 'Include missing answers',
    description:
      'Should missing or unanswered questions be included in the output? Default is "Yes".',
    type: FieldType.BOOLEAN,
    required: false,
  },
  separator: {
    id: 'separator',
    label: 'Separator',
    description:
      'The separator to use between questions. If not provided, questions will be separated by a blank line.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  scope: ScopeEnum.default('Step'),
  formSelection: FormSelectionEnum.default('Latest'),
  language: LanguageEnum.default('English'),
  includeDescriptions: z.boolean().optional().default(true),
  includeMissingAnswers: z.boolean().optional().default(true),
  separator: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
