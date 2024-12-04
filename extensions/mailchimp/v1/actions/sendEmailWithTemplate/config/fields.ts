import { isNil, isEmpty } from 'lodash'
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
  templateName: {
    id: 'templateName',
    label: 'Template name',
    description:
      'The immutable name or slug of a template that exists in your account.',
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
      'An array of template content to send. Each item in the array should be a struct with two keys - name: the name of the content block to set the content for, and content: the actual content to put into the block',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

interface TemplateContent {
  name: string
  content: string
}

export const FieldsValidationSchema = z.object({
  to: getEmailValidation(),
  subject: z.string(),
  templateName: z.string(),
  templateContent: z
    .optional(z.string())
    .transform((str, ctx): TemplateContent[] => {
      if (isNil(str) || isEmpty(str)) return []

      try {
        const parsedJson = JSON.parse(str)

        if (isEmpty(parsedJson)) {
          return []
        }

        if (!Array.isArray(parsedJson)) {
          ctx.addIssue({
            code: 'custom',
            message: 'templateContent should be an array',
          })
          return z.NEVER
        }

        const allObjectsHaveKeys = parsedJson.every((obj) => {
          if (typeof obj !== 'object') {
            ctx.addIssue({
              code: 'custom',
              message:
                'Object entries in templateContent array should be an object',
            })
            return z.NEVER
          }

          return 'name' in obj && 'content' in obj
        })

        if (!allObjectsHaveKeys) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Every object in the templateContent array should (only) have a `name` and `content` field',
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
