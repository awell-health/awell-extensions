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
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const api = makeAPIClient(settings)

    await api.addHistory({
      type: fields.type,
      patient: fields.patientId,
      text: fields.text,
    })

    await onComplete()
  },
}
