import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  FieldsSchema,
  DeliveryResultType,
} from './config'
import { type settings, SettingsSchema } from '../../settings'
import { TextEmAllClient } from '../../lib'

/**
 * Known Text-Em-All error codes and their meanings.
 */
const ERROR_CODES = {
  NO_VALID_CONTACTS: 3005, // "NoValidBroadcastContacts" - invalid/opted-out number
} as const

/**
 * Determines the delivery result based on an error response.
 */
function getResultFromError(errorCode?: number, errorName?: string, message?: string): {
  result: string
  details: string
} {
  // Handle known error codes
  if (errorCode === ERROR_CODES.NO_VALID_CONTACTS || errorName === 'NoValidBroadcastContacts') {
    return {
      result: DeliveryResultType.INVALID_NUMBER,
      details: message ?? 'Phone number is invalid or recipient cannot receive text messages',
    }
  }

  // Default for unknown errors
  return {
    result: DeliveryResultType.FAILED,
    details: message ?? 'Broadcast creation failed',
  }
}

export const createSMSBroadcast: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createSMSBroadcast',
  title: 'Send a new SMS broadcast',
  description:
    'Send a text message to a recipient. Returns the delivery result (sent, invalid_number, failed, etc.) for triage purposes.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      fields: {
        broadcastName: BroadcastName,
        phoneNumber,
        textMessage: TextMessage,
        textNumberID: TextNumberID,
        startDate: StartDate,
      },
      settings,
    } = validate({
      schema: z.object({ fields: FieldsSchema, settings: SettingsSchema }),
      payload,
    })

    const client = new TextEmAllClient(settings)
    const request = {
      BroadcastName,
      BroadcastType: 'SMS',
      TextMessage,
      TextNumberID,
      StartDate,
      Contacts: [{ PrimaryPhone: phoneNumber }],
    }

    const resp = await client.createBroadcast(request)
    const data = resp.data

    // Success - broadcast created
    if (resp.status === 200 && 'BroadcastID' in data) {
      await onComplete({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `SMS broadcast created successfully`,
            },
          },
        ],
        data_points: {
          success: 'true',
          broadcastId: data.BroadcastID.toString(),
          broadcastStatus: data.BroadcastStatus,
          uriBroadcastDetails: data.UriBroadcastDetails,
          broadcastStatusCategory: data.BroadcastStatusCategory,
          broadcastStartDate: data.StartDate,
          deliveryResult: DeliveryResultType.SENT,
          deliveryResultDetails: 'Message sent to carrier for delivery',
        },
      })
      return
    }

    // Handle rate limiting (429)
    if (resp.status === 429) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Rate limit exceeded. Please try again later.' },
            error: {
              category: 'SERVER_ERROR',
              message: 'Rate limit exceeded (429)',
            },
          },
        ],
      })
      return
    }

    // Handle API errors (400, etc.) - these are valid results, not failures
    if ('ErrorCode' in data || 'ErrorName' in data || 'Message' in data) {
      const errorData = data as { ErrorCode?: number; ErrorName?: string; Message?: string }
      const { result, details } = getResultFromError(
        errorData.ErrorCode,
        errorData.ErrorName,
        errorData.Message,
      )

      // Return as success with the error result - this is valid triage data
      await onComplete({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `SMS broadcast result: ${result} - ${details}`,
            },
          },
        ],
        data_points: {
          success: 'false',
          broadcastId: '',
          broadcastStatus: '',
          uriBroadcastDetails: '',
          broadcastStatusCategory: '',
          broadcastStartDate: '',
          deliveryResult: result,
          deliveryResultDetails: details,
        },
      })
      return
    }

    // Unknown error
    await onError({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: 'Broadcast creation failed with unknown error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'Broadcast creation failed',
          },
        },
      ],
    })
  },
} satisfies Action<typeof fields, typeof settings>
