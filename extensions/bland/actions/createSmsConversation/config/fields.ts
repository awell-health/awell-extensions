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
    description: 'The phone number of the user in the conversation (E.164 format).',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  agentNumber: {
    id: 'agentNumber',
    label: 'Agent phone number',
    description:
      'The Bland-owned, SMS-enabled phone number for the conversation (E.164 format).',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    description:
      'The message to seed the conversation with. It is recorded in the conversation but NOT sent to the user.',
    type: FieldType.TEXT,
    required: true,
  },
  sender: {
    id: 'sender',
    label: 'Sender',
    description:
      'Who the seeded message is attributed to. Defaults to USER when omitted.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: [
        { value: 'USER', label: 'User' },
        { value: 'AGENT', label: 'Agent' },
      ],
    },
  },
  currPathwayId: {
    id: 'currPathwayId',
    label: 'Current pathway ID',
    description: 'The pathway to position the conversation on.',
    type: FieldType.STRING,
    required: false,
  },
  currPathwayVersion: {
    id: 'currPathwayVersion',
    label: 'Current pathway version',
    description: 'The version of the pathway.',
    type: FieldType.STRING,
    required: false,
  },
  currentNodeId: {
    id: 'currentNodeId',
    label: 'Current node ID',
    description: 'The pathway node the conversation should be positioned at.',
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
  requestData: {
    id: 'requestData',
    label: 'Request data',
    description:
      'JSON object of variables made available to the pathway/agent during the conversation. Can be referenced with Prompt Variables.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  userNumber: z.string().trim().min(1),
  agentNumber: z.string().trim().min(1),
  message: z.string().trim().min(1),
  sender: z.enum(['USER', 'AGENT']).optional(),
  currPathwayId: z.string().optional(),
  currPathwayVersion: z.string().optional(),
  currentNodeId: z.string().optional(),
  newConversation: dropdownOptionsBooleanSchema.optional(),
  requestData: JsonObjectSchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
