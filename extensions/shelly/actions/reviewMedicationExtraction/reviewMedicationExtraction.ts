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
    await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    // Completion in Hosted Pages
  },
}
