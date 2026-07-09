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
import {
  SendSmsChannelSchema,
  SendSmsPersonaVersionSchema,
} from '../../../api/schema'

export const fields = {
  to: {
    id: 'to',
    label: 'To',
    description:
      'The E.164 formatted phone number of the user receiving the message.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  agentNumber: {
    id: 'agentNumber',
    label: 'Agent number',
    description:
      'The E.164 formatted phone number used to send the message (must belong to the authenticated account).',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
  },
  text: {
    id: 'text',
    label: 'Message',
    description:
      'The content of the SMS message to send. If left empty, Bland generates a response using the pathway/prompt the conversation has been set up with.',
    type: FieldType.TEXT,
    required: false,
  },
  newConversation: {
    id: 'newConversation',
    label: 'New conversation',
    description:
      'Create a new conversation, archiving the existing conversation and ignoring existing SMS messages.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: dropdownOptionsBoolean,
    },
  },
  personaId: {
    id: 'personaId',
    label: 'Persona ID',
    description:
      "UUID of a persona to use for this conversation. When provided, the persona's configuration is applied instead of the number's SMS config.",
    type: FieldType.STRING,
    required: false,
  },
  personaVersion: {
    id: 'personaVersion',
    label: 'Persona version',
    description: 'Which version of the persona to use.',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: [
        { value: 'production', label: 'Production' },
        { value: 'draft', label: 'Draft' },
      ],
    },
  },
  personaSettings: {
    id: 'personaSettings',
    label: 'Persona settings',
    description:
      'Per-dispatch persona overrides (JSON). Takes priority over any pathway settings on the persona version or the pathway ID field below. Supports pathway_id, pathway_version and start_node_id.',
    type: FieldType.JSON,
    required: false,
  },
  pathwayId: {
    id: 'pathwayId',
    label: 'Pathway ID',
    description:
      'ID of the pathway to use for generating the SMS response. If a persona ID is provided, this is used as a pathway override within the persona context.',
    type: FieldType.STRING,
    required: false,
  },
  pathwayVersion: {
    id: 'pathwayVersion',
    label: 'Pathway version',
    description: 'Version of the pathway to use.',
    type: FieldType.STRING,
    required: false,
  },
  startNodeId: {
    id: 'startNodeId',
    label: 'Start node ID',
    description: 'ID of the specific node within the pathway to start from.',
    type: FieldType.STRING,
    required: false,
  },
  webhook: {
    id: 'webhook',
    label: 'Webhook',
    description:
      'Overrides the webhook for the conversation, instead of using the webhook attached to the phone number.',
    type: FieldType.STRING,
    stringType: StringType.URL,
    required: false,
  },
  requestData: {
    id: 'requestData',
    label: 'Request data',
    description:
      'Custom metadata (JSON) to attach to the conversation. This data is returned in all webhook payloads, making it useful for correlating conversations with your internal systems.',
    type: FieldType.JSON,
    required: false,
  },
  metadata: {
    id: 'metadata',
    label: 'Metadata',
    description:
      'Optional metadata (JSON) to associate with the conversation or message. Used for custom routing or analytics.',
    type: FieldType.JSON,
    required: false,
  },
  outcomeIds: {
    id: 'outcomeIds',
    label: 'Outcome IDs',
    description:
      'Comma-separated list of outcome IDs to run when the conversation ends. If omitted, the outcomes configured on the SMS number are used.',
    type: FieldType.STRING,
    required: false,
  },
  citationSchemaIds: {
    id: 'citationSchemaIds',
    label: 'Citation schema IDs',
    description:
      'Comma-separated list of citation schema IDs to extract when the conversation ends. If omitted, the citation schemas configured on the SMS number are used.',
    type: FieldType.STRING,
    required: false,
  },
  channel: {
    id: 'channel',
    label: 'Channel',
    description: 'The channel to send the message on. Defaults to "sms".',
    type: FieldType.STRING,
    required: false,
    options: {
      dropdownOptions: [
        { value: 'sms', label: 'SMS' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'imessage', label: 'iMessage' },
      ],
    },
  },
  contentSid: {
    id: 'contentSid',
    label: 'Content SID',
    description:
      'The Twilio SID of the content to send, usually in HXXXX format.',
    type: FieldType.STRING,
    required: false,
  },
  contentVariables: {
    id: 'contentVariables',
    label: 'Content variables',
    description:
      'The variables to send with the content, as a JSON object (e.g. {"1": "John", "2": "Smith"}).',
    type: FieldType.JSON,
    required: false,
  },
  timeOut: {
    id: 'timeOut',
    label: 'Timeout (seconds)',
    description:
      'Per-conversation timeout override, in seconds. When the user goes silent for this long after an agent message, the timeout flow fires.',
    type: FieldType.NUMERIC,
    required: false,
  },
  timeoutMessage: {
    id: 'timeoutMessage',
    label: 'Timeout message',
    description:
      'Per-conversation override for the message sent when the timeout fires.',
    type: FieldType.TEXT,
    required: false,
  },
  warningTime: {
    id: 'warningTime',
    label: 'Warning time (seconds)',
    description:
      'Per-conversation override for how long, in seconds, to wait before sending the warning message. Must be less than the timeout.',
    type: FieldType.NUMERIC,
    required: false,
  },
  warningMessage: {
    id: 'warningMessage',
    label: 'Warning message',
    description:
      'Per-conversation override for the warning message sent at the warning time.',
    type: FieldType.TEXT,
    required: false,
  },
  otherData: {
    id: 'otherData',
    label: 'Other data',
    description:
      'Any fields you put in here (JSON) will be sent in the request body, but will be overridden by all other fields above if that field is also set.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>

const commaSeparatedToArray = z
  .string()
  .transform((val) =>
    val
      .trim()
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  )

export const FieldsValidationSchema = z.object({
  to: z.string().trim().min(1),
  agentNumber: z.string().trim().min(1),
  text: z.string().optional(),
  newConversation: dropdownOptionsBooleanSchema.optional(),
  personaId: z.string().optional(),
  personaVersion: SendSmsPersonaVersionSchema.optional(),
  personaSettings: JsonObjectSchema.optional(),
  pathwayId: z.string().optional(),
  pathwayVersion: z.string().optional(),
  startNodeId: z.string().optional(),
  webhook: z.string().optional(),
  requestData: JsonObjectSchema.optional(),
  metadata: JsonObjectSchema.optional(),
  outcomeIds: commaSeparatedToArray.optional(),
  citationSchemaIds: commaSeparatedToArray.optional(),
  channel: SendSmsChannelSchema.optional(),
  contentSid: z.string().optional(),
  contentVariables: JsonObjectSchema.optional(),
  timeOut: z.number().optional(),
  timeoutMessage: z.string().optional(),
  warningTime: z.number().optional(),
  warningMessage: z.string().optional(),
  otherData: JsonObjectSchema.optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
