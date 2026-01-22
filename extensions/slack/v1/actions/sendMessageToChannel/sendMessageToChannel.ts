import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { z } from 'zod'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import {
  SlackClient,
  isSlackErrorResponse,
  mapSlackErrorToActivityEvent,
} from '../../../client'

export const sendMessageToChannel: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendMessageToChannel',
  title: 'Send Message to Channel',
  description: 'Send a message to a Slack channel.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { botToken },
        fields: { channel, message },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const slackClient = new SlackClient({ botToken })

      const response = await slackClient.postMessage({
        channel,
        text: message,
      })

      await onComplete({
        data_points: {
          messageTs: response.ts ?? '',
          channelId: response.channel ?? '',
        },
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Message sent to channel ${response.channel ?? channel}`,
            },
          },
        ],
      })
    } catch (error) {
      if (isSlackErrorResponse(error)) {
        await onError({
          events: [mapSlackErrorToActivityEvent(error)],
        })
      } else {
        throw error
      }
    }
  },
}
