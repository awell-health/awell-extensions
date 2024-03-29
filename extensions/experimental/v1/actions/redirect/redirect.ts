import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const redirect: Action<typeof fields, typeof settings> = {
  key: 'redirect',
  category: Category.WORKFLOW,
  title: 'Redirect',
  description: 'Redirect the user to a website or a location within your app',
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
