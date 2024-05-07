import { Category, validate, type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const embeddedCheckout: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'embeddedCheckout',
  category: Category.BILLING,
  title: 'Embedded checkout',
  description: 'Embedded checkout in Awell Hosted Pages',
  fields,
  previewable: false,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    // Completion happens in Hosted Pages
  },
}
