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
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing trackEvent')

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
