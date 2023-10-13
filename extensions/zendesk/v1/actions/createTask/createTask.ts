import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import {
  ZendeskClient,
  isSalesApiError,
  salesApiErrorToActivityEvent,
} from '../../client'

export const createTask: Action<typeof fields, typeof settings> = {
  key: 'createTask',
  title: 'Create task',
  description: 'Creates a new task in Zendesk',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { salesApiToken },
        fields: {
          content,
          dueDate,
          ownerId,
          resourceType,
          resourceId,
          completed,
          remindAt,
        },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new ZendeskClient({
        salesApiToken,
      })

      const res = await client.salesApi.createTask({
        content,
        due_date: dueDate,
        owner_id: ownerId,
        resource_type: resourceType,
        resource_id: resourceId,
        completed,
        remind_at: remindAt,
      })

      await onComplete({ data_points: { taskId: String(res.data.data.id) } })
    } catch (err) {
      if (isSalesApiError(err)) {
        const events = salesApiErrorToActivityEvent(err)
        await onError({ events })
      } else {
        // re-throw to be handled in extensions server
        throw err
      }
    }
  },
}
