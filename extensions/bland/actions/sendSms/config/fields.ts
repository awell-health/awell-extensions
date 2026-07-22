import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'
import {
  dropdownOptionsBoolean,
  dropdownOptionsBooleanSchema,
  JsonObjectSchema,
} from '../../../lib/sharedActionFields'

export const fields = {
  userNumber: {
    id: 'userNumber',
    label: 'User phone number',
    description: 'The phone number of the recipient (E.164 format).',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  agentNumber: {
    id: 'agentNumber',
    label: 'Agent phone number',
    description:
      'The Bland-owned, SMS-enabled phone number to send the message from (E.164 format).',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  agentMessage: {
    id: 'agentMessage',
    label: 'Agent message',
    description:
      'The message to send. When omitted and a pathway is configured on the agent number, the pathway generates the message.',
    type: FieldType.TEXT,
    required: false,
  },
  pathwayId: {
    id: 'pathwayId',
    label: 'Pathway ID',
    description:
      'The conversational pathway to drive the SMS conversation with.',
    type: FieldType.STRING,
    required: false,
  },
  newConversation: {
    id: 'newConversation',
    label: 'Start new conversation',
    description:
      'When enabled, starts a fresh conversation instead of continuing an existing one.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  webhook: {
    id: 'webhook',
    label: 'Webhook',
    description:
      'The webhook URL to send SMS conversation events to. The Awell activity ID is appended as an activity_id query parameter for correlation.',
    type: FieldType.STRING,
    stringType: StringType.URL,
    required: false,
  },
  timeOut: {
    id: 'timeOut',
    label: 'Timeout (seconds)',
    description:
      'Seconds of user silence (after an agent message) before the timeout flow fires (warning message and/or conversation end). Overrides the time_out on the agent number\u2019s SMS config and persists on the conversation.',
    type: FieldType.NUMERIC,
    required: false,
  },
  timeoutMessage: {
    id: 'timeoutMessage',
    label: 'Timeout message',
    description:
      'The message sent to the user when the timeout fires. Overrides the timeout_message on the agent number\u2019s SMS config.',
    type: FieldType.TEXT,
    required: false,
  },
  warningTime: {
    id: 'warningTime',
    label: 'Warning time (seconds)',
    description:
      'Seconds of user silence before sending the warning message. Must be less than the timeout. Overrides the warning_time on the agent number\u2019s SMS config.',
    type: FieldType.NUMERIC,
    required: false,
  },
  warningMessage: {
    id: 'warningMessage',
    label: 'Warning message',
    description:
      'The warning message sent to the user at the warning time. Overrides the warning_message on the agent number\u2019s SMS config.',
    type: FieldType.TEXT,
    required: false,
  },
  requestData: {
    id: 'requestData',
    label: 'Request data',
    description:
      'JSON object of variables made available to the pathway/agent during the conversation. Can be referenced with Prompt Variables.',
    type: FieldType.JSON,
    required: false,
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description:
      'Add any additional information you want to associate with the conversation.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userNumber: z.string().trim().min(1),
  agentNumber: z.string().trim().min(1),
  agentMessage: z.string().optional(),
  pathwayId: z.string().optional(),
  newConversation: dropdownOptionsBooleanSchema.optional(),
  webhook: z.string().optional(),
  timeOut: z.number().optional(),
  timeoutMessage: z.string().optional(),
  warningTime: z.number().optional(),
  warningMessage: z.string().optional(),
  requestData: JsonObjectSchema.optional(),
  metadata: JsonObjectSchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
