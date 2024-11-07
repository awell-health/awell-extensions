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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
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
  },
}
