import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints } from './config'
import { FieldsValidationSchema } from './config/fields'
import { z } from 'zod'

export const generateRandomNumber: Action<typeof fields, typeof settings> = {
  key: 'generateRandomNumber',
  title: 'Generate random number',
  description: 'Generate a random number between a given range.',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: { min, max },
    } = validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    const [minSerialized, maxSerialized] = [min, max].sort((a, b) => a - b)

    const generatedNumber =
      Math.floor(Math.random() * (maxSerialized - minSerialized + 1)) +
      minSerialized

    await onComplete({
      data_points: {
        generatedNumber: String(generatedNumber),
      },
    })
  },
}
