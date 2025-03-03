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
  title: 'Send a new SMS broadcast',
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
    } else if (resp.status === 400) {
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
    } else {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Broadcast creation failed' },
            error: {
              category: 'SERVER_ERROR',
              message: 'Broadcast creation failed',
            },
          },
        ],
      })
    }
  },
} satisfies Action<typeof fields, typeof settings>
