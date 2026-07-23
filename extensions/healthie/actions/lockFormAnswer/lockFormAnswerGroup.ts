import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'

export const lockFormAnswerGroup: Action<typeof fields, typeof settings> = {
  key: 'lockFormAnswerGroup',
  category: Category.EHR_INTEGRATIONS,
  title: 'Lock form answers',
  description:
    'Lock form answers from form answer group to prevent further editing',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing lockFormAnswerGroup',
    )

    try {
      const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      await healthieSdk.client.mutation({
        lockFormAnswerGroup: {
          __args: {
            input: {
              id: fields.id,
            },
          },
          form_answer_group: {
            id: true,
          },
        },
      })

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
