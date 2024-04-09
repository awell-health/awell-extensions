import { type Field, FieldType } from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  signerRole: {
    id: 'signerRole',
    label: 'Signer role',
    description:
      "Must match an existing role in chosen template. It's case-sensitive.",
    type: FieldType.STRING,
    required: true,
  },
  signerName: {
    id: 'signerName',
    label: 'Signer name',
    description: 'The name of the signer.',
    type: FieldType.STRING,
    required: true,
  },
  signerEmailAddress: {
    id: 'signerEmailAddress',
    label: 'Signer email address',
    description: 'The email address of the signer.',
    type: FieldType.STRING,
    required: true,
  },
  templateId: {
    id: 'templateId',
    label: 'Template ID',
    description:
      'Use the template id to create a SignatureRequest from a template.',
    type: FieldType.STRING,
    required: true,
  },
  title: {
    id: 'title',
    label: 'Title',
    description: 'The title you want to assign to the SignatureRequest.',
    type: FieldType.STRING,
    required: false,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject in the email that will be sent to the signer.',
    type: FieldType.STRING,
    required: false,
  },
  message: {
    id: 'message',
    label: 'Message',
    description:
      'The custom message in the email that will be sent to the signer.',
    type: FieldType.STRING,
    required: false,
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description: 'An array defining values and options for custom fields.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

interface CustomFieldSchema {
  name: string
  editor?: string
  required?: boolean
  value: string
}

export const FieldsValidationSchema = z.object({
  signerRole: z.string(),
  signerName: z.string(),
  signerEmailAddress: z.string().email(),
  templateId: z.string(),
  title: z.optional(z.string()),
  subject: z.optional(z.string()),
  message: z.optional(z.string()),
  customFields: z
    .optional(z.string())
    .transform((str, ctx): CustomFieldSchema[] => {
      if (isNil(str) || isEmpty(str)) return []

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return []
        }

        if (!Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'custom fields should be an array',
          })
          return z.NEVER
        }

        const allObjectsHaveKeys = parsedJson.every((obj) => {
          if (typeof obj !== 'object') {
            ctx.addIssue({
              code: 'custom',
              message:
                'Object entries in custom fields array should be an object',
            })
            return z.NEVER
          }

          return 'name' in obj && 'value' in obj
        })

        if (!allObjectsHaveKeys) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Every object in custom fields array should have a `name` and `value` field',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid custom fields data' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
