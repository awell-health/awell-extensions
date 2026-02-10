import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  FieldsSchema,
  BroadcastInputSchema,
  DeliveryResultType,
} from './config'
import { type settings, SettingsSchema } from '../../settings'
import { TextEmAllClient } from '../../lib'
import { isEmpty } from 'lodash'

/**
 * Known Text-Em-All error codes and their meanings.
 */
const ERROR_CODES = {
  NO_VALID_CONTACTS: 3005, // "NoValidBroadcastContacts" - invalid/opted-out number
} as const

/**
 * Determines the delivery result based on an error response.
 */
function getResultFromError(
  errorCode?: number,
  errorName?: string,
  message?: string,
): {
  result: string
  details: string
} {
  if (
    errorCode === ERROR_CODES.NO_VALID_CONTACTS ||
    errorName === 'NoValidBroadcastContacts'
  ) {
    return {
      result: DeliveryResultType.INVALID_NUMBER,
      details:
        message ??
        'Phone number is invalid or recipient cannot receive text messages',
    }
  }

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
  onEvent: async ({
    payload,
    onComplete,
    onError,
    helpers: { log },
  }): Promise<void> => {
    // Step 1: Extract raw field values and settings
    const { fields: rawFields, settings } = validate({
      schema: z.object({ fields: FieldsSchema, settings: SettingsSchema }),
      payload,
    })

    const patientProfile = payload.patient?.profile

    // Step 2: Resolve values — fields take priority, patient profile is fallback
    let phoneNumber = rawFields.phoneNumber
    if (isEmpty(phoneNumber)) {
      phoneNumber = patientProfile?.mobile_phone ?? patientProfile?.phone
      if (isEmpty(phoneNumber)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: 'No phone number provided and no mobile phone found on patient profile.',
              },
              error: {
                category: 'WRONG_INPUT',
                message:
                  'No phone number provided and no mobile phone found on patient profile',
              },
            },
          ],
        })
        return
      }
      log(
        { source: 'patient_profile', field: 'mobile_phone' },
        'Phone number not provided — using patient profile mobile phone',
      )
    }

    let firstName = rawFields.firstName
    if (isEmpty(firstName) && !isEmpty(patientProfile?.first_name)) {
      firstName = patientProfile?.first_name as string
      log(
        { source: 'patient_profile', field: 'first_name' },
        'First name not provided — using patient profile first name',
      )
    }

    let lastName = rawFields.lastName
    if (isEmpty(lastName) && !isEmpty(patientProfile?.last_name)) {
      lastName = patientProfile?.last_name as string
      log(
        { source: 'patient_profile', field: 'last_name' },
        'Last name not provided — using patient profile last name',
      )
    }

    // Step 3: Validate the resolved input (NANP phone format, date transform, etc.)
    const input = BroadcastInputSchema.parse({
      broadcastName: rawFields.broadcastName,
      phoneNumber,
      firstName,
      lastName,
      notes: rawFields.notes,
      integrationData: rawFields.integrationData,
      textMessage: rawFields.textMessage,
      textNumberID: rawFields.textNumberID,
      startDate: rawFields.startDate,
      checkCallingWindow: rawFields.checkCallingWindow,
    })

    // Step 4: Build the API request
    const contact: Record<string, string> = {
      PrimaryPhone: input.phoneNumber,
    }
    if (!isEmpty(input.firstName)) {
      contact.FirstName = input.firstName as string
    }
    if (!isEmpty(input.lastName)) {
      contact.LastName = input.lastName as string
    }
    if (!isEmpty(input.notes)) {
      contact.Notes = input.notes as string
    }
    if (!isEmpty(input.integrationData)) {
      contact.IntegrationData = input.integrationData as string
    }

    const request = {
      BroadcastName: input.broadcastName,
      BroadcastType: 'SMS',
      TextMessage: input.textMessage,
      TextNumberID: input.textNumberID,
      StartDate: input.startDate,
      CheckCallingWindow: input.checkCallingWindow,
      Contacts: [contact],
    }

    // Step 5: Send to Text-Em-All
    const client = new TextEmAllClient(settings)
    const resp = await client.createBroadcast(request)
    const data = resp.data

    // Success - broadcast created
    if (resp.status === 200 && 'BroadcastID' in data) {
      await onComplete({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'SMS broadcast created successfully' },
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

    // Rate limiting (429) — transient, retry may help
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

    // API errors (400, etc.) — valid triage data, not a retry candidate
    if ('ErrorCode' in data || 'ErrorName' in data || 'Message' in data) {
      const errorData = data as {
        ErrorCode?: number
        ErrorName?: string
        Message?: string
      }
      const { result, details } = getResultFromError(
        errorData.ErrorCode,
        errorData.ErrorName,
        errorData.Message,
      )

      await onComplete({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `SMS broadcast result: ${result} - ${details}` },
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
