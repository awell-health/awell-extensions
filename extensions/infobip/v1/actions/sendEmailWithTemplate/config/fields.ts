import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  makeStringOptional,
  type json,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'

export const fields = {
  to: {
    label: 'To',
    id: 'to',
    type: FieldType.STRING,
    required: true,
    description: 'The email address to which you intend to send the email',
  },
  subject: {
    label: 'Subject',
    id: 'subject',
    type: FieldType.STRING,
    required: false,
    description:
      'When provided, it overwrites the subject specified in the Broadcast template',
  },
  templateId: {
    label: 'Template ID',
    id: 'templateId',
    type: FieldType.NUMERIC,
    required: true,
    description: 'The ID of the template used for generating email content',
  },
  placeholders: {
    label: 'Placeholders',
    id: 'placeholders',
    type: FieldType.JSON,
    required: true,
    description:
      'The values for the placeholders defined in your template. Must be a valid key-value pair JSON object.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  to: z.string().email(),
  subject: makeStringOptional(z.string()),
  templateId: z.number(),
  placeholders: z
    .optional(z.string())
    .transform((str, ctx): z.infer<ReturnType<typeof json>> => {
      if (isNil(str) || isEmpty(str)) return {}

      try {
        return JSON.parse(str)
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
        return z.NEVER
      }
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
