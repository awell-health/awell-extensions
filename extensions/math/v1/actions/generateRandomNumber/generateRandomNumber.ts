import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints } from './config'
import { FieldsValidationSchema } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const generateRandomNumber: Action<typeof fields, typeof settings> = {
  key: 'generateRandomNumber',
  title: 'Generate random number',
  description: 'Generate a random number between a given range.',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    try {
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

      helpers.log(
        { meta, min, max, generatedNumber },
        'Generated random number',
      )

      await onComplete({
        data_points: {
          generatedNumber: String(generatedNumber),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
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
