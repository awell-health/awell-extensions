import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'
import { htmlToBase64Pdf } from '../../../../../src/utils/htmlToPdf'

export const htmlToPdf: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'htmlToPdf',
  title: 'HTML to PDF',
  description:
    'Convert an HTML string to a PDF base64 string, to be uploaded or sent in a future action',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete }) => {
    const {
      fields: { htmlString, options },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const base64Pdf = await htmlToBase64Pdf(htmlString, options)

    await onComplete({
      data_points: {
        base64Pdf,
      },
    })
  },
}
