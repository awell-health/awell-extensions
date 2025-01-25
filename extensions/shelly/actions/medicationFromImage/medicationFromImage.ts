import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { MedicationExtractorApi } from '../../lib/api'
import { FetchError } from '../../lib/api/medicationExtractorApi'

export const medicationFromImage: Action<
  typeof fields,
  Record<string, never>,
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
      pathway: { id: pathwayId },
      activity: { id: activityId },
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const medicationExtractorApi = new MedicationExtractorApi()

      const data = await medicationExtractorApi.extractMedicationFromImage({
        imageUrl,
        context: { pathwayId, activityId },
      })

      await onComplete({
        data_points: {
          data: JSON.stringify({
            medications: data.medications,
          }),
        },
      })
    } catch (error) {
      if (error instanceof FetchError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${error.statusCode} (${error.statusText}): ${error.responseBody}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${error.statusCode} (${error.statusText}): ${error.responseBody}`,
              },
            },
          ],
        })
        return
      }

      // Other errors are handled in extensions-server
      throw error
    }
  },
}
