import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import {
  SendbirdClient,
  isSendbirdDeskError,
  sendbirdDeskErrorToActivityEvent,
} from '../../client'
import { isEmpty, isNil } from 'lodash'

export const createTicket: Action<typeof fields, typeof settings> = {
  key: 'createTicket',
  title: 'Create ticket',
  description: 'Creates a ticket using the Desk API.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: {
          customerId,
          channelName,
          groupKey,
          priority,
          customFields,
          relatedChannelUrls,
        },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new SendbirdClient({
        applicationId,
        chatApiToken,
        deskApiToken,
      })

      const res = await client.deskApi.createTicket({
        customerId,
        channelName,
        groupKey,
        priority,
        customFields,
        relatedChannelUrls,
      })

      const {
        data: { id, channelUrl, relatedChannels },
      } = res

      /**
       * Array data point types not supported yet so storing as a comma-separated string
       */
      const relatedChannelUrlsArray =
        isEmpty(relatedChannels) || isNil(relatedChannels)
          ? undefined
          : (JSON.parse(relatedChannels) as Array<{
              name: string
              channel_url: string
            }>)
      const relatedChannelUrlsDataPoint =
        relatedChannelUrlsArray?.map((value) => value.channel_url).join(',') ??
        undefined

      await onComplete({
        data_points: {
          ticketId: String(id),
          channelUrl,
          relatedChannelUrls: relatedChannelUrlsDataPoint,
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (isSendbirdDeskError(err)) {
        const events = sendbirdDeskErrorToActivityEvent(err)
        await onError({ events })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
