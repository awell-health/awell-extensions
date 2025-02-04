import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const addMessageToThread: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addMessageToThread',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add Message to an existing thread',
  description:
    'Adds a message to an existing thread in Elation',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const api = makeAPIClient(settings)
    
    const { id } = await api.addMessageToThread({
      thread: fields.threadId,
      sender: fields.senderId,
      body: fields.messageBody,
      send_date: new Date().toISOString(),
    })

    await onComplete({
      data_points: {
        messageId: String(id),
      },
    })
  },
}
