import { Category, validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: z.object({
          hostedPagesEnvironmentVariable: z
            .string()
            .min(1, 'Missing Hosted Pages environment variable'),
          liveModePublishableKey: z
            .string()
            .min(1, 'Missing live mode publishable key'),
          testModePublishableKey: z
            .string()
            .min(1, 'Missing test mode publishable key'),
        }),
      }),
      payload,
    })

    // Completion happens in Hosted Pages
  },
}
