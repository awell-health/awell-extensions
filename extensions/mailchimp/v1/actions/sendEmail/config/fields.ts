import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'
import { getEmailValidation } from '../../../../../../src/lib/awell'

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
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject of your email.',
    type: FieldType.STRING,
    required: true,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'The content of your message.',
    type: FieldType.HTML,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  to: getEmailValidation(),
  subject: z.string(),
  body: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
