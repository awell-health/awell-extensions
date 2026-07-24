import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { IterableClient } from '../../client'

export const trackEvent: Action<typeof fields, typeof settings> = {
  key: 'trackEvent',
  title: 'Track event',
  description: 'Track an event in Iterable',
  category: Category.COMMUNICATION,
  fields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    helpers.log({ fields: payload.fields }, 'Processing trackEvent')

    try {
      const {
        settings: { apiKey },
        fields: { eventName, email, userId, dataFields },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new IterableClient({
        apiKey,
      })

      await client.eventsApi.trackEvent({
        eventName,
        email,
        userId,
        dataFields,
      })

      await onComplete()
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
