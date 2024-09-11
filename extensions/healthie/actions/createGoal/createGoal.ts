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
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
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
  },
}
