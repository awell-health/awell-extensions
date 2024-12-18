import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
} from '@awell-health/extensions-core'
import { JsonStringValidationSchema } from '../../../../../sendbird/v1/validation'

export const fields = {
  label: {
    id: 'label',
    label: 'Select - Label',
    description:
      'Enter the label text that will be displayed before the selector.',
    type: FieldType.STRING,
    required: true,
  },
  mandatory: {
    id: 'mandatory',
    label: 'Select - Response required?',
    description: 'The user must select an option before continuing.',
    type: FieldType.BOOLEAN,
    required: true,
  },
  url: {
    id: 'url',
    label: 'Options - Endpoint URL',
    description:
      'Enter the URL (starting with `https://`) where the options to display can be fetched. The endpoint must return an array of objects with the following properties: `id`, `label` and `value`.',
    type: FieldType.STRING,
    required: true,
  },
  headers: {
    id: 'headers',
    label: 'Options - Headers',
    description:
      'Enter the headers to send to the options source URL. The headers must be in JSON format.',
    type: FieldType.JSON,
    required: false,
  },
  queryParam: {
    id: 'queryParam',
    label: 'Options - Search query param',
    description:
      'Enter the key of the free text search query param if the endpoint supports this e.g. `search` for `https://example.com/options?search=foo`.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  headers: makeStringOptional(JsonStringValidationSchema),
  queryParam: makeStringOptional(z.string()),
  mandatory: z.boolean(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
