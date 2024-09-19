import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { MedicationExtractorApi } from '../../medicationExtractorApi'

export const medicationFromImage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'medicationFromImage',
  category: Category.WORKFLOW,
  title: 'Extract medication from image',
  description: 'Generates structured medication list from picture ',
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

    const medicationExtractorApi = new MedicationExtractorApi()
    const data = await medicationExtractorApi.extractMedicationFromImage(
      imageUrl
    )

    if (data?.status !== 'OK') {
      const error_explanation =
        data?.error_explanation ??
        'Error while executing Medication Extractor API'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: error_explanation,
            },
            error: {
              category: 'BAD_REQUEST',
              message: error_explanation,
            },
          },
        ],
      })
    } else {
      await onComplete({
        data_points: {
          data: JSON.stringify({
            medications: data.medications,
          }),
        },
      })
    }
  },
}
