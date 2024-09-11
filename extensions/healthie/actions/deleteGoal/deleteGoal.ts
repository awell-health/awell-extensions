import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'

export const deleteGoal: Action<typeof fields, typeof settings> = {
  key: 'deleteGoal',
  category: Category.EHR_INTEGRATIONS,
  title: 'Delete goal',
  description: 'Delete a goal for a patient in Healthie',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    await healthieSdk.client.mutation({
      deleteGoal: {
        __args: {
          input: {
            id: fields.goalId,
          },
        },
        goal: {
          id: true,
        },
      },
    })

    await onComplete()
  },
}
