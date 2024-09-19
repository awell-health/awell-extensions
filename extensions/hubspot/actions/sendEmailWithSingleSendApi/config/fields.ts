import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import { isEmpty } from 'lodash'

export const fields = {
  emailId: {
    id: 'emailId',
    label: 'Email ID',
    description: 'The ID of the email (template)',
    type: FieldType.STRING,
    required: true,
  },
  from: {
    id: 'from',
    label: 'From',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  to: {
    id: 'to',
    label: 'To',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  contactProperties: {
    id: 'contactProperties',
    label: 'Contact properties',
    description:
      'A JSON map of contact property values. Each property will be set on the contact record.',
    type: FieldType.JSON,
    required: false,
  },
  customProperties: {
    id: 'customProperties',
    label: 'Custom properties',
    description:
      'A JSON map of key-value properties that will be rendered in the template.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  emailId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  contactProperties: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, string> => {
      if (isEmpty(str)) {
        return {}
      }

      try {
        const parsedJson = JSON.parse(str as string)

        if (isEmpty(parsedJson)) {
          return {}
        }

        if (
          typeof parsedJson !== 'object' ||
          Array.isArray(parsedJson) ||
          Object.values(parsedJson).some((value) => typeof value !== 'string')
        ) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Contact properties must be a key-value map where each value is a string',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
  customProperties: z
    .optional(z.string())
    .transform((str, ctx): Record<string, unknown> => {
      if (isEmpty(str)) return {}

      try {
        return JSON.parse(str as string)
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
