import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const showQRCode: Action<typeof fields, typeof settings> = {
  key: 'showQRCode',
  category: Category.WORKFLOW,
  title: 'Show QR Code',
  description:
    'Display a QR code in Hosted Pages. The patient can show the code to another person (e.g. a home nurse) to give them access to their own Hosted Pages session.',
  fields,
  dataPoints,
  previewable: false,
  supports_automated_retries: false,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    await onComplete({ data_points: {} })
  },
}
