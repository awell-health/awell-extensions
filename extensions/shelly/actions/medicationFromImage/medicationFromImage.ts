// import { AwellSdk } from '@awell-health/awell-sdk'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const medicationFromImage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'medicationFromImage',
  category: Category.WORKFLOW,
  title: 'Summarize form',
  description: 'Summarize the response of a form',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { imageUrl },
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    console.log(imageUrl)
    // Call whatever API with the file URL and get back JSON
    const data = await Promise.resolve({ dummy: 'data' })

    await onComplete({
      data_points: {
        data: JSON.stringify(data),
      },
    })
  },
}
