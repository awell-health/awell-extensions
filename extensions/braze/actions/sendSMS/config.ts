import {
  type Fields,
  type DataPointDefinition,
  FieldType,
} from '@awell-health/extensions-core'
import { z } from 'zod'

export const fields = {
  subscriptionGroupId: {
    id: 'subscriptionGroupId',
    label: 'Subscription Group ID',
    type: FieldType.STRING,
    required: true,
    description: 'The ID of your subscription group.',
  },
  externalUserId: {
    id: 'externalUserId',
    label: 'External User ID',
    type: FieldType.STRING,
    required: true,
    description:
      'The ID of the user in your system that this message is being sent to.',
  },
  body: {
    id: 'body',
    label: 'Body',
    type: FieldType.TEXT,
    required: true,
    description: 'The body of the SMS.',
  },
  appId: {
    id: 'appId',
    label: 'App ID',
    type: FieldType.STRING,
    required: true,
    description: 'App id is the reference of the specific app.',
  },
  linkShorteningEnabled: {
    id: 'linkShorteningEnabled',
    label: 'Link Shortening Enabled',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'Use this field to turn on link shortening and campaign-level click tracking',
  },
  useClickTrackingEnabled: {
    id: 'useClickTrackingEnabled',
    label: 'Use Click Tracking Enabled',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'If `Link Shortening Enabled` is true, use this field to turn on link shortening, and campaign-level and user-level click tracking',
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
  SMSDispatchId: {
    key: 'SMSDispatchId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  subscriptionGroupId: z.string().min(1),
  externalUserId: z.string().min(1),
  body: z.string().min(1),
  appId: z.string().min(1),
  linkShorteningEnabled: z.boolean().optional(),
  useClickTrackingEnabled: z.boolean().optional(),
  campaignId: z.string().optional(),
  messageVariantionId: z.string().optional(),
})
export type ActionFields = z.infer<typeof FieldsSchema>
