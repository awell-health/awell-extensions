import { isEmpty, isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '../../../../../lib/types'

export const fields = {
  uploadPreset: {
    id: 'uploadPreset',
    label: 'Upload preset',
    description:
      'The name of an upload preset defined for your product environment. If left empty, the preset defined in the extension settings will be used.',
    type: FieldType.STRING,
    required: true,
  },
  folder: {
    id: 'folder',
    label: 'Folder',
    description:
      'Upload files to the specified folder. If left empty, the folder defined in the extension settings will be used.',
    type: FieldType.STRING,
    required: false,
  },
  tags: {
    id: 'tags',
    label: 'Tags',
    description:
      'A comma-separated string of tags to assign to the uploaded assets.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  uploadPreset: z.optional(z.string()),
  folder: z.optional(z.string()),
  tags: z.optional(
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
} satisfies Record<keyof typeof fields, ZodTypeAny>)
