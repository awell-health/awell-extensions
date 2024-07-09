import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'

export const getFormAnswers: Action<typeof fields, typeof settings> = {
  key: 'getFormAnswers',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get form answers',
  description: 'Retrieve form answers from form answer group',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, sdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await sdk.getFormAnswerGroup(input)

    await onComplete({
      data_points: {
        formAnswers: JSON.stringify(res.data.formAnswerGroup?.form_answers),
      },
    })
  },
}
