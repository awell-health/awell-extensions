import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import {
  ZendeskClient,
  isSalesApiError,
  salesApiErrorToActivityEvent,
} from '../../client'

export const completeTask: Action<typeof fields, typeof settings> = {
  key: 'completeTask',
  title: 'Complete a task',
  description: 'Completes a task in Zendesk',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { salesApiToken },
        fields: { taskId },
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

      await client.salesApi.updateTask(taskId, {
        completed: true,
      })

      await onComplete()
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
