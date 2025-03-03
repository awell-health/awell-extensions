import { z } from 'zod'

import {
  type Fields,
  type DataPointDefinition,
  FieldType,
  StringType,
  DateTimeSchema,
} from '@awell-health/extensions-core'

import { BroadcastTypes } from './types'
import { AudioSchema, TransferSchema } from '../types'
import { validateJsonField } from '../utils/validateJsonField'
import { parsePhoneNumber } from 'libphonenumber-js'
import format from 'date-fns/format'
import { isNil } from 'lodash'

export const fields = {
  broadcastName: {
    id: 'broadcastName',
    label: 'Broadcast Name',
    type: FieldType.STRING,
    required: true,
    description: 'The name of the broadcast.',
  },
  broadcastType: {
    id: 'broadcastType',
    label: 'Broadcast Type',
    type: FieldType.STRING,
    required: true,
    description: 'The type of broadcast.',
    options: {
      dropdownOptions: Object.values(BroadcastTypes.enum).map((type) => ({
        label: type,
        value: type,
      })),
    },
  },
  startDate: {
    id: 'startDate',
    label: 'Start Date',
    type: FieldType.STRING,
    required: false,
    description:
      'The time the broadcast should start. Will default to start immediately. If provided must be a datetime as ISO 8601 string and time to send the message in UTC',
  },
  maxMessageLength: {
    id: 'maxMessageLength',
    label: 'Max Message Length',
    type: FieldType.NUMERIC,
    required: false,
    description:
      'The maximum number of seconds the audio message can be. If not set, the value from your voice settings.',
  },
  callerID: {
    id: 'callerID',
    label: 'Caller ID',
    type: FieldType.STRING,
    required: false,
    description:
      'Voice messages will appear to be coming from this phone number. If left blank, we will default to the callerID in your voice settings. Must be a valid North American Numbering Plan (NANP) phone number.',
  },
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone Number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
    description: 'The primary phone number of the recipient in E.164 format',
  },
  checkCallingWindow: {
    id: 'checkCallingWindow',
    label: 'Check Calling Window',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'Used for voice messages only and determines whether to enforce or ignore the user`s calling window. Defaults to True.',
  },
  continueOnNextDay: {
    id: 'continueOnNextDay',
    label: 'Continue On Next Day',
    type: FieldType.BOOLEAN,
    required: false,
    description: 'Can override the "continue on next day" user setting.',
  },
  transferAndConnect: {
    id: 'transferAndConnect',
    label: 'Transfer and Connect',
    type: FieldType.JSON,
    required: false,
    description:
      'The settings for transfer & connect broadcasts. Only required for Transfer & Connect type broadcasts.',
  },
  audio: {
    id: 'audio',
    label: 'Audio',
    type: FieldType.JSON,
    required: false,
    description:
      'The assigned audio message for voice broadcasts. This ID can be found in your Message Library. If left blank you will receive a message recording information in your response.',
  },
  audioVM: {
    id: 'audioVM',
    label: 'Audio VM',
    type: FieldType.JSON,
    required: false,
    description:
      'This message plays if the contact`s message is left on the recipient`s voicemail.',
  },
  retryTimes: {
    id: 'retryTimes',
    label: 'Retry Times',
    type: FieldType.NUMERIC,
    required: false,
    description:
      'The number of times a call is retried after busy signal or no answer. Defaults to retry settings in your account.',
  },
  callThrottle: {
    id: 'callThrottle',
    label: 'Call Throttle',
    type: FieldType.NUMERIC,
    required: false,
    description:
      'The call speed specifies the number of simultaneous calls that can be ongoing at any given time. Defaults to call speed settings in your account.',
  },
} satisfies Fields

export const dataPoints = {
  broadcastId: {
    key: 'broadcastId',
    valueType: 'number',
  },
  broadcastStatus: {
    key: 'broadcastStatus',
    valueType: 'string',
  },
  uriBroadcastDetails: {
    key: 'uriBroadcastDetails',
    valueType: 'string',
  },
  broadcastStatusCategory: {
    key: 'broadcastStatusCategory',
    valueType: 'string',
  },
  broadcastStartDate: {
    key: 'broadcastStartDate',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  broadcastName: z.string(),
  broadcastType: BroadcastTypes,
  startDate: DateTimeSchema.optional().transform((date) => {
    if (isNil(date) || date === '') return undefined
    // format is required: 2/1/2020 1:15PM',
    return format(new Date(date), 'M/d/yyyy h:mmaa')
  }),
  maxMessageLength: z.number().optional(),
  callerID: z.string().optional(),
  phoneNumber: z.string().transform((phone) => {
    const parsedNumber = parsePhoneNumber(phone)
    return parsedNumber.format('NATIONAL') // Returns "(XXX) XXX-XXXX" NANP format
  }),
  checkCallingWindow: z.boolean().optional(),
  continueOnNextDay: z.boolean().optional(),
  transferAndConnect: z
    .optional(z.string())
    .transform(
      validateJsonField(
        TransferSchema,
        'Missing required transfer details fields. Required fields: transferNumber, transferMessage, transferDigit, transferIntroduction',
      ),
    ),
  audio: z
    .optional(z.string())
    .transform(
      validateJsonField(
        AudioSchema,
        'Invalid audio details. Required fields: Uri, AudioID, Name, Description, Favorite, Shared, Length, MessageType, ReadOnly, Created, LastUsed, TextToSpeech, Text, Voice',
      ),
    ),
  audioVM: z
    .optional(z.string())
    .transform(
      validateJsonField(
        AudioSchema,
        'Invalid audioVM details. Required fields: Uri, AudioID, Name, Description, Favorite, Shared, Length, MessageType, ReadOnly, Created, LastUsed, TextToSpeech, Text, Voice',
      ),
    ),
  retryTimes: z.number().optional(),
  callThrottle: z.number().optional(),
})
export type ActionFields = z.infer<typeof FieldsSchema>
