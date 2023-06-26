import { isNil, isEmpty } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'

export const fields = {
  to: {
    id: 'to',
    label: 'To',
    description: 'The email address of the recipient.',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    required: true,
  },
  templateId: {
    id: 'templateId',
    label: 'Template ID',
    description: 'The immutable ID of a template that exists in your account.',
    type: FieldType.STRING,
    required: true,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject of your email.',
    type: FieldType.STRING,
    required: true,
  },
  templateContent: {
    id: 'templateContent',
    label: 'Template content',
    description:
      'An object of template content to send. Dynamic template data is available using Handlebars syntax and this field is a collection of key/value pairs following the pattern "variable_name":"value to insert".',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

interface TemplateContent {
  [key: string]: string | number | boolean | TemplateContent
}

export const FieldsValidationSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  templateId: z.string(),
  templateContent: z
    .optional(z.string())
    .transform((str, ctx): TemplateContent => {
      if (isNil(str) || isEmpty(str)) return {}

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return {}
        }

        if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'templateContent should be an object',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
