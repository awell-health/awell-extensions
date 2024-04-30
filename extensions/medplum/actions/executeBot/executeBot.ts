import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'

export const executeBot: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'executeBot',
  category: Category.EHR_INTEGRATIONS,
  title: 'Execute Bot',
  description: 'Execute a Medplum Bot',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await medplumSdk.executeBot(
      input.botId,
      input.body,
      'application/json'
    )

    await onComplete({
      data_points: {
        data: JSON.stringify(res),
      },
    })
  },
}
