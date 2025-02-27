import {
  type Fields,
  type DataPointDefinition,
  FieldType,
  DateTimeSchema,
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
  scheduleTime: {
    id: 'scheduleTime',
    label: 'Schedule Time',
    type: FieldType.DATE,
    required: true,
    description:
      'The time to schedule the SMS to be sent. Must be a datetime as ISO 8601 string and time to send the message in UTC',
  },
  inPatientLocalTime: {
    id: 'inPatientLocalTime',
    label: 'In Patient Local Time',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      "If true, the schedule time will be in the patient's local time.",
  },
  atOptimalTime: {
    id: 'atOptimalTime',
    label: 'At Optimal Time',
    type: FieldType.BOOLEAN,
    required: false,
    description: 'If true, the schedule time will be at the optimal time.',
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
  SMSScheduleId: {
    key: 'SMSScheduleId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  subscriptionGroupId: z.string().min(1),
  externalUserId: z.string().min(1),
  body: z.string().min(1),
  appId: z.string().min(1),
  scheduleTime: DateTimeSchema,
  inPatientLocalTime: z.boolean().optional(),
  atOptimalTime: z.boolean().optional(),
  linkShorteningEnabled: z.boolean().optional(),
  useClickTrackingEnabled: z.boolean().optional(),
  campaignId: z.string().optional(),
  messageVariantionId: z.string().optional(),
})
export type ActionFields = z.infer<typeof FieldsSchema>
