import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { type ZodTypeAny, z } from 'zod'

export const zOcrProvider = z.enum(['awell-landing-ai'])

const OcrProviderOptions: Record<z.infer<typeof zOcrProvider>, string> = {
  'awell-landing-ai': 'Awell (Landing.ai)',
}

export const fields = {
  faxId: {
    id: 'faxId',
    label: 'Fax Id',
    description: 'Sometimes also referred to as the job ID',
    type: FieldType.STRING,
    required: true,
  },
  ocrProvider: {
    id: 'ocrProvider',
    label: 'OCR Provider',
    description: 'The provider or service used for OCR',
    type: FieldType.STRING,
    required: true,
    options: {
      dropdownOptions: Object.entries(OcrProviderOptions).map(
        ([key, value]) => ({
          label: value,
          value: key,
        }),
      ),
    },
  },
  ocrProviderApiKey: {
    id: 'ocrProviderApiKey',
    label: 'OCR Provider API Key',
    description: 'We advise using a obfuscated constant',
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
  faxId: z.string().min(1),
  ocrProvider: zOcrProvider,
  ocrProviderApiKey: z.string().min(1),
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
