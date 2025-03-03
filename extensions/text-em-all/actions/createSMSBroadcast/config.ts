import { z } from 'zod'

import {
  type Fields,
  type DataPointDefinition,
  FieldType,
  StringType,
  DateTimeSchema,
} from '@awell-health/extensions-core'
import { parsePhoneNumber } from 'libphonenumber-js'
import { isNil } from 'lodash'
import format from 'date-fns/format'

export const fields = {
  broadcastName: {
    id: 'broadcastName',
    label: 'Broadcast Name',
    type: FieldType.STRING,
    required: true,
    description: 'The name of the broadcast.',
  },
  phoneNumber: {
    id: 'phoneNumber',
    label: 'Phone Number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: true,
    description:
      'The primary phone number of the recipient. Must be a valid North American Numbering Plan (NANP) phone number.',
  },
  textMessage: {
    id: 'textMessage',
    label: 'Text Message',
    type: FieldType.TEXT,
    required: true,
    description:
      'The text of the message for a text type broadcast. The max length is based on the setting in your account.',
  },
  textNumberID: {
    id: 'textNumberID',
    label: 'Text Number ID',
    type: FieldType.NUMERIC,
    required: false,
    description:
      'The ID of the text number your messages will be sent from. If omitted, the default text number on your account will be used.',
  },
  startDate: {
    id: 'startDate',
    label: 'Start Date',
    type: FieldType.DATE,
    required: false,
    description:
      'The time the broadcast should start. Will default to start immediately. If provided must be a datetime as ISO 8601 string and time to send the message in UTC',
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
  phoneNumber: z.string().transform((phone) => {
    const parsedNumber = parsePhoneNumber(phone)
    return parsedNumber.format('NATIONAL') // Returns "(XXX) XXX-XXXX" NANP format
  }),
  textMessage: z.string(),
  textNumberID: z.number().optional(),
  startDate: DateTimeSchema.optional().transform((date) => {
    if (isNil(date) || date === '') return undefined
    // format is required: 2/1/2020 1:15PM',
    return format(new Date(date), 'M/d/yyyy h:mmaa')
  }),
})
export type ActionFields = z.infer<typeof FieldsSchema>
