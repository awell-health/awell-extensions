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
  description: 'Adds a message to an existing thread in Elation',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const api = makeAPIClient(settings)

    const addMessageToThreadInput = {
      thread: fields.threadId,
      sender: fields.senderId,
      body: fields.messageBody,
      send_date: new Date().toISOString(),
    }

    helpers.log(
      { meta, addMessageToThreadInput },
      '[addMessageToThread] Adding Elation thread message',
    )

    const { id } = await api.addMessageToThread(addMessageToThreadInput)

    await onComplete({
      data_points: {
        messageId: String(id),
      },
    })
  },
}
