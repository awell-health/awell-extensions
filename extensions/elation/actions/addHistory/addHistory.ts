import { z } from 'zod'

import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields as elationFields } from './config'

export const addHistory: Action<typeof elationFields, typeof settings> = {
  key: 'addHistory',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add History',
  description: "Add history item on Elation's patient page",
  fields: elationFields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing addHistory')

    try {
      const { fields, settings } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const api = makeAPIClient(settings)

      const addHistoryInput = {
        type: fields.type,
        patient: fields.patientId,
        text: fields.text,
      }

      helpers.log(
        { meta, addHistoryInput },
        '[addHistory] Adding Elation history',
      )

      await api.addHistory(addHistoryInput)

      await onComplete()
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
