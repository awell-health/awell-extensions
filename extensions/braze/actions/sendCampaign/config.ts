import {
  type Fields,
  type DataPointDefinition,
  FieldType,
} from '@awell-health/extensions-core'
import { isEmpty, isNil } from 'lodash'
import { z } from 'zod'

export const fields = {
  campaignId: {
    id: 'campaignId',
    label: 'Campaign ID',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of the campaign to send the email with attributes to.',
  },
  sendId: {
    id: 'sendId',
    label: 'Send ID',
    type: FieldType.STRING,
    required: false,
    description: 'Send identifier (optional)',
  },
  externalUserId: {
    id: 'externalUserId',
    label: 'External User ID',
    type: FieldType.STRING,
    required: false,
    description:
      'The ID of the user in your system that this message is being sent to. Either external_user_id or email must be provided.',
  },
  email: {
    id: 'email',
    label: 'Email',
    type: FieldType.STRING,
    required: false,
    description:
      'The email address of the user to send the email to. Either External User ID or Email must be provided.',
  },
  triggerProperties: {
    id: 'triggerProperties',
    label: 'Trigger Properties',
    type: FieldType.JSON,
    required: false,
    description:
      'Key-value pairs that can be referenced in your message template to personalize it and insert dynamic content.',
  },
  attributes: {
    id: 'attributes',
    label: 'Attributes',
    type: FieldType.JSON,
    required: false,
    description:
      'Create or update user-specific profile attribute. Attributes can trigger campaigns, can be used for segmentation, and personalization of messages.',
  },
} satisfies Fields

export const dataPoints = {
  EmailDispatchId: {
    key: 'EmailDispatchId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  campaignId: z.string().min(1),
  sendId: z.string().optional(),
  externalUserId: z.string().optional(),
  email: z.string().optional(),
  triggerProperties: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, string> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)
        return parsedJson
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          message: 'triggerProperties is not a valid JSON object',
        })
        return z.NEVER
      }
    }),
  attributes: z
    .string()
    .optional()
    .transform((str, ctx): Record<string, string> | undefined => {
      if (isNil(str) || isEmpty(str)) return undefined

      try {
        const parsedJson = JSON.parse(str)
        return parsedJson
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          message: 'attributes is not a valid JSON object',
        })
        return z.NEVER
      }
    }),
})

export type ActionFields = z.infer<typeof FieldsSchema>
