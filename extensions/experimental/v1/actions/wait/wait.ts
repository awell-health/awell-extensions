import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const wait: Action<typeof fields, typeof settings> = {
  key: 'wait',
  category: Category.WORKFLOW,
  title: 'Wait',
  description: 'Wait n number of seconds before completing',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: { seconds },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const waitInMs = seconds * 1000
    await new Promise((resolve) => setTimeout(resolve, waitInMs))

    await onComplete()
  },
}
