import {
  type Fields,
  type DataPointDefinition,
  FieldType,
} from '@awell-health/extensions-core'
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
    description: 'Personalization key-value pairs that will apply to this user',
  },
  attributes: {
    id: 'attributes',
    label: 'Attributes',
    type: FieldType.JSON,
    required: false,
    description:
      'Attributes will create or update an attribute of that name with the given value on the specified user profile before the message is sent and existing values will be overwritten',
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
  triggerProperties: z.record(z.string(), z.string()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
})
export type ActionFields = z.infer<typeof FieldsSchema>
