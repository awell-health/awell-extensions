import { isNil, isEmpty } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { getEmailValidation } from '../../../../../../src/lib/awell'

export const fields = {
  fromName: {
    id: 'fromName',
    label: 'From name',
    description:
      'The name that will be used for the "From" header. When left blank, the value specified in the extension settings will be used.',
    type: FieldType.STRING,
    required: false,
  },
  fromEmail: {
    id: 'fromEmail',
    label: 'From email',
    description:
      'The email address that will be used for the "From" header. When left blank, the value specified in the extension settings will be used.',
    type: FieldType.STRING,
    required: false,
  },
  to: {
    id: 'to',
    label: 'To',
    description: 'The email address of the recipient.',
    type: FieldType.STRING,
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
    description:
      'The subject of your email. If you would like to compose a dynamic subject line then pass a subject field with the template content below.',
    type: FieldType.STRING,
    required: false,
  },
  dynamicTemplateData: {
    id: 'dynamicTemplateData',
    label: 'Template content',
    description:
      'Specify a JSON blob containing the dynamic data of your template. Read the Sendgrid documentation to learn more about dynamic template data.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | JSONValue[]

type TemplateData = Record<string, JSONValue>

export const FieldsValidationSchema = z.object({
  to: getEmailValidation(),
  subject: z.optional(
    z.string().transform((str) => (isEmpty(str) ? undefined : str))
  ),
  templateId: z.string(),
  dynamicTemplateData: z
    .optional(z.string())
    .transform((str, ctx): TemplateData => {
      if (isNil(str) || isEmpty(str)) return {}

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return {}
        }

        if (typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'dynamicTemplateData should be an object',
          })
          return z.NEVER
        }

        return parsedJson
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
  fromName: z.string().optional(),
  fromEmail: getEmailValidation().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
