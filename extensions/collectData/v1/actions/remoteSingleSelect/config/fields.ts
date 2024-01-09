import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  questionLabel: {
    id: 'questionLabel',
    label: 'Label text',
    description:
      'Enter the label text that will be displayed before the selector.',
    type: FieldType.STRING,
    required: true,
  },
  optionsSourceUrl: {
    id: 'optionsSourceUrl',
    label: 'Options endpoint URL',
    description:
      'Enter the URL containing the options to display in the selector. The endpoint must return an array of objects with the following properties: `id`, `label` and `value`.',
    type: FieldType.STRING,
    required: true,
  },
  optionsSourceHeaders: {
    id: 'optionsSourceHeaders',
    label: 'Options endpoint headers',
    description:
      'Enter the headers to send to the options source URL. The headers must be in JSON format.',
    type: FieldType.JSON,
    required: false,
  },
  optionsSourceSearchQueryParams: {
    id: 'optionsSourceSearchQueryParams',
    label: 'Options endpoint search query param key',
    description:
      'Enter the key of the search query param to send to the options source URL e.g. `search` for `https://example.com/options?search=foo`.',
    type: FieldType.STRING,
    required: true,
  },
  mandatory: {
    id: 'mandatory',
    label: 'Is response required?',
    description: 'The user must select an option before continuing.',
    type: FieldType.BOOLEAN,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  questionLabel: z.string().nonempty(),
  optionsSourceUrl: z.string().url(),
  optionsSourceHeaders: z.record(z.string()),
  optionsSourceQueryParams: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
