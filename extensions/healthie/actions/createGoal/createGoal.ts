import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'

export const createGoal: Action<typeof fields, typeof settings> = {
  key: 'createGoal',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create goal',
  description: 'Create a goal for a patient in Healthie',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing createGoal')

    try {
      const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const input = {
        user_id: fields.healthiePatientId,
        repeat: fields.repeat,
        title_link: fields.titleLink,
        name: fields.name,
        due_date: fields.dueDate,
      }

      const res = await healthieSdk.client.mutation({
        createGoal: {
          __args: {
            input,
          },
          goal: {
            id: true,
          },
        },
      })

      await onComplete({
        data_points: {
          createdGoalId: String(res.createGoal?.goal?.id),
        },
      })
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
