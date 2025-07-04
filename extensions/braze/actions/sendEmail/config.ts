import {
  type Fields,
  type DataPointDefinition,
  FieldType,
} from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  externalUserId: {
    id: 'externalUserId',
    label: 'External User ID',
    type: FieldType.STRING,
    required: true,
    description:
      'The ID of the user in your system that this message is being sent to.',
  },
  appId: {
    id: 'appId',
    label: 'App ID',
    type: FieldType.STRING,
    required: false,
    description:
      'Specifies the app within your Braze workspace the activity will be associated with. Can also be provided via the extension settings.',
  },
  from: {
    id: 'from',
    label: 'From',
    type: FieldType.STRING,
    required: true,
    description:
      'valid email address in the format "Display Name <email@address.com>"',
  },
  replyTo: {
    id: 'replyTo',
    label: 'Reply To',
    type: FieldType.STRING,
    required: false,
    description:
      'Valid email address in the format "email@address.com" - defaults to your workspace`s default reply to if not set',
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    type: FieldType.STRING,
    required: false,
    description: 'The subject of the email.',
  },
  body: {
    id: 'body',
    label: 'Body',
    type: FieldType.HTML,
    required: true,
    description: 'The body of the email.',
  },
  preheader: {
    id: 'preheader',
    label: 'Preheader',
    type: FieldType.STRING,
    required: false,
    description:
      'The preheader of the email. Recommended length 50-100 characters',
  },
  shouldInlineCss: {
    id: 'shouldInlineCss',
    label: 'Should inline CSS',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'Whether to inline the CSS of the body of the email. If not provided, falls back to the default CSS inlining value for the workspace ',
  },
  campaignId: {
    id: 'campaignId',
    label: 'Campaign ID',
    type: FieldType.STRING,
    required: false,
    description: 'Optional but required if you wish to track campaign stats',
  },
  messageVariantionId: {
    id: 'messageVariantionId',
    label: 'Message Variantion ID',
    type: FieldType.STRING,
    required: false,
    description:
      'Used when providing a campaign_id to specify which message variation this message should be tracked under',
  },
} satisfies Fields

export const dataPoints = {
  EmailDispatchId: {
    key: 'EmailDispatchId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  externalUserId: z.string().min(1),
  appId: z.string().optional(),
  from: z.string(),
  replyTo: z.string().optional(),
  subject: z.string().optional(),
  body: z.string(),
  preheader: z.string().optional(),
  shouldInlineCss: z.boolean().optional(),
  campaignId: z.string().optional(),
  messageVariantionId: z.string().optional(),
})
export type ActionFields = z.infer<typeof FieldsSchema>
