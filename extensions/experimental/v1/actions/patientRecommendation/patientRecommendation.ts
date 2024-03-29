import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const patientRecommendation: Action<typeof fields, typeof settings> = {
  key: 'patientRecommendation',
  category: Category.WORKFLOW,
  title: 'Patient recommendation',
  description: 'Recommend the patient with an office visit, video chat, ...',
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    // Completion happens in Hosted Pages
  },
}
