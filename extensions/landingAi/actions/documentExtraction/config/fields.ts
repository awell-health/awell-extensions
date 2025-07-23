import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  fileType: {
    id: 'fileType',
    label: 'File type',
    description: 'The type of file to extract data from',
    type: FieldType.STRING,
    options: {
      dropdownOptions: [
        {
          label: 'Image',
          value: 'image',
        },
        {
          label: 'PDF',
          value: 'pdf',
        },
      ],
    },
    required: true,
  },
  fileUrl: {
    id: 'fileUrl',
    label: 'File URL',
    description: 'The URL of the file to extract data from',
    type: FieldType.STRING,
    required: true,
  },
  fieldsSchema: {
    id: 'fieldsSchema',
    label: 'Fields schema',
    description:
      'Defines the structure of the fields to extract from the document. Providing a schema is optional but strongly recommended, as it significantly improves the accuracy of the extracted data.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  fileType: z.enum(['image', 'pdf']),
  fileUrl: z.string().min(1),
  fieldsSchema: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, unknown> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) return undefined

        return parsedJson
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          message: 'Not a valid JSON object',
        })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
