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
  title: 'Create a new call broadcast',
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
    const { data } = await client.createBroadcast(request)
    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: `Broadcast created. Response: ${JSON.stringify(data)}` },
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
  },
} satisfies Action<typeof fields, typeof settings>
