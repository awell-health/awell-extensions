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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, sdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await sdk.createGoal({
      user_id: input.healthiePatientId,
      repeat: input.repeat,
      title_link: input.titleLink,
      name: input.name,
    })

    await onComplete({
      data_points: {
        createdGoalId: String(res.data?.createGoal?.goal?.id),
      },
    })
  },
}
