import { isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType, type json } from '@awell-health/extensions-core'
import { CommaSeparatedEmailsValidationSchema } from '../../../../../../src/lib/awell'

export const fields = {
  to: {
    id: 'to',
    label: 'To',
    description: 'The email address of the recipient.',
    type: FieldType.STRING,
    /**
     * I am purposely not using the `email` stringType yet.
     * More information here: https://awellhealth.atlassian.net/jira/polaris/projects/AH/ideas/view/548618?selectedIssue=AH-176&issueViewLayout=sidebar&issueViewSection=capture&focusedInsightId=3144292
     */
    // stringType: StringType.EMAIL,
    required: true,
  },
  template: {
    id: 'template',
    label: 'Template',
    description:
      'The name of the template you created in the Mailgun web portal.',
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
  variables: {
    id: 'variables',
    label: 'Variables',
    description: 'Pass values for variables you defined in your template.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  to: CommaSeparatedEmailsValidationSchema.refine(
    (emails) => emails.length > 0,
    {
      message: 'At least one email address is required',
    }
  ),
  subject: z.string(),
  template: z.string(),
  variables: z
    .optional(z.string())
    .transform((str, ctx): z.infer<ReturnType<typeof json>> => {
      if (isNil(str)) return {}

      try {
        return JSON.parse(str)
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
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
