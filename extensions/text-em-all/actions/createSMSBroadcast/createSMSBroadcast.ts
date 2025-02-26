import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsSchema } from './config'
import { type settings, SettingsSchema } from '../../settings'
import { TextEmAllClient } from '../../lib'

export const createSMSBroadcast: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createSMSBroadcast',
  title: 'Create a new SMS broadcast',
  description:
    'A broadcast is a feature that allows you to send a text message to a recipient at specific time',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
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
