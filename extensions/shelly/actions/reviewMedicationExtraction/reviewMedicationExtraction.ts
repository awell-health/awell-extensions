// import { AwellSdk } from '@awell-health/awell-sdk'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const reviewMedicationExtraction: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'reviewMedicationExtraction',
  category: Category.WORKFLOW,
  title: 'Review medication extraction',
  description: 'Allow a stakeholder to review the medication extraction',
  fields,
  previewable: false,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log(
      { fields: payload.fields },
      'Processing reviewMedicationExtraction',
    )

    try {
      await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      // Completion in Hosted Pages
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
