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
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
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
  },
}
