import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsSchema } from './config'
import { type settings, SettingsSchema } from '../../settings'
import { TextEmAllClient } from '../../lib'

export const createCallBroadcast: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createCallBroadcast',
  title: 'Send a new call broadcast',
  description:
    'A broadcast is a feature that allows you to initiate a call to a recipient at specific time',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const {
      fields: {
        broadcastName: BroadcastName,
        broadcastType: BroadcastType,
        startDate: StartDate,
        callerID: CallerID,
        transferAndConnect: TransferAndConnect,
        audio: Audio,
        maxMessageLength: MaxMessageLength,
        retryTimes: RetryTimes,
        callThrottle: CallThrottle,
        checkCallingWindow: CheckCallingWindow,
        continueOnNextDay: ContinueOnNextDay,
        phoneNumber,
      },
      settings,
    } = validate({
      schema: z.object({ fields: FieldsSchema, settings: SettingsSchema }),
      payload,
    })

    const client = new TextEmAllClient(settings)
    const request = {
      BroadcastName,
      BroadcastType,
      StartDate,
      CallerID,
      TransferAndConnect,
      Audio,
      MaxMessageLength,
      RetryTimes,
      CallThrottle,
      CheckCallingWindow,
      ContinueOnNextDay,
      Contacts: [{ PrimaryPhone: phoneNumber }],
    }
    const resp = await client.createBroadcast(request)
    const data = resp.data
    if (resp.status === 200 && 'BroadcastID' in data) {
      await onComplete({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Broadcast created. Response: ${JSON.stringify(data)}`,
            },
          },
        ],
        data_points: {
          broadcastId: data.BroadcastID.toString(),
          broadcastStatus: data.BroadcastStatus,
          uriBroadcastDetails: data.UriBroadcastDetails,
          broadcastStatusCategory: data.BroadcastStatusCategory,
          broadcastStartDate: data.StartDate,
        },
      })
    } else {
      const errorMessage = 'Message' in data ? data.Message : 'Unknown error'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Broadcast creation failed: ${errorMessage}` },
            error: {
              category: 'BAD_REQUEST',
              message: 'Broadcast creation failed',
            },
          },
        ],
      })
    }
  },
} satisfies Action<typeof fields, typeof settings>
