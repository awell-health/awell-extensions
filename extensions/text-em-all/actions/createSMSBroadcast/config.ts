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
    required: false,
    description:
      'The primary phone number of the recipient. Must be a valid NANP phone number. If omitted, falls back to the patient mobile phone from their profile.',
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    type: FieldType.STRING,
    required: false,
    description: 'The first name of the contact. If omitted, falls back to the patient first name from their profile.',
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    type: FieldType.STRING,
    required: false,
    description: 'The last name of the contact. If omitted, falls back to the patient last name from their profile.',
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    type: FieldType.STRING,
    required: false,
    description: 'Notes about the contact (e.g., "Eligibility form from Awell").',
  },
  integrationData: {
    id: 'integrationData',
    label: 'Integration Data',
    type: FieldType.STRING,
    required: false,
    description: 'Extra field for integration information.',
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
  checkCallingWindow: {
    id: 'checkCallingWindow',
    label: 'Check Calling Window',
    type: FieldType.BOOLEAN,
    required: false,
    description:
      'Whether to enforce the calling window restrictions. Defaults to false.',
  },
} satisfies Fields

/**
 * Result types for SMS broadcast creation.
 * - 'sent': Broadcast created successfully, message sent to carrier
 * - 'invalid_number': Phone number is invalid or recipient cannot receive texts (opted out, etc.)
 * - 'failed': Other API errors
 */
export const DeliveryResultType = {
  SENT: 'sent',
  INVALID_NUMBER: 'invalid_number',
  FAILED: 'failed',
} as const

export type DeliveryResult =
  (typeof DeliveryResultType)[keyof typeof DeliveryResultType]

export const dataPoints = {
  /**
   * Whether the SMS was sent successfully.
   * true = message sent to carrier, false = failed (invalid number, opted out, etc.)
   */
  success: {
    key: 'success',
    valueType: 'boolean',
  },
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
  /**
   * The result of the SMS broadcast creation.
   * Possible values:
   * - 'sent': Broadcast created, message sent to carrier for delivery
   * - 'invalid_number': Phone number is invalid or recipient cannot receive texts
   * - 'failed': Other API errors
   */
  deliveryResult: {
    key: 'deliveryResult',
    valueType: 'string',
  },
  /**
   * Additional details about the result.
   * Contains the error message from Text-Em-All for failed requests.
   */
  deliveryResultDetails: {
    key: 'deliveryResultDetails',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

/** Schema for raw field extraction (no transforms, just type checking) */
export const FieldsSchema = z.object({
  broadcastName: z.string(),
  phoneNumber: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
  integrationData: z.string().optional(),
  textMessage: z.string(),
  textNumberID: z.number().optional(),
  startDate: DateTimeSchema.optional(),
  checkCallingWindow: z.boolean().optional().default(false),
})
export type ActionFields = z.infer<typeof FieldsSchema>

/**
 * Schema for the final resolved broadcast input — after patient profile
 * fallbacks have been applied. This is where all transforms and
 * required-field checks live so everything is validated in one pass.
 */
export const BroadcastInputSchema = z.object({
  broadcastName: z.string(),
  phoneNumber: z.string().transform((phone) => {
    const parsed = parsePhoneNumber(phone)
    return parsed.format('NATIONAL') // "(XXX) XXX-XXXX" NANP format
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
  integrationData: z.string().optional(),
  textMessage: z.string(),
  textNumberID: z.number().optional(),
  startDate: z
    .string()
    .optional()
    .transform((date) => {
      if (isNil(date) || date === '') return undefined
      // format required by Text-Em-All: '2/1/2020 1:15PM'
      return format(new Date(date), 'M/d/yyyy h:mmaa')
    }),
  checkCallingWindow: z.boolean(),
})
export type BroadcastInput = z.infer<typeof BroadcastInputSchema>
