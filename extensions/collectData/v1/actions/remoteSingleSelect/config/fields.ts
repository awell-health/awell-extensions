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
    label: 'Label text',
    description:
      'Enter the label text that will be displayed before the selector.',
    type: FieldType.STRING,
    required: true,
  },
  url: {
    id: 'url',
    label: 'Options endpoint URL',
    description:
      'Enter the URL where the options to display in the selector can be fetched. The endpoint must return an array of objects with the following properties: `label` and `value`.',
    type: FieldType.STRING,
    required: true,
  },
  headers: {
    id: 'headers',
    label: 'Options endpoint headers',
    description:
      'Enter the headers to send to the options source URL. The headers must be in JSON format.',
    type: FieldType.JSON,
    required: false,
  },
  queryParam: {
    id: 'queryParam',
    label: 'Options endpoint search query param key',
    description:
      'Enter the key of the free text search query param if the endpoint supports this e.g. `search` for `https://example.com/options?search=foo`.',
    type: FieldType.STRING,
    required: false,
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
  label: z.string().nonempty(),
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
