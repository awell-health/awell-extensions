import { type Action, type NewActivityPayload } from '../../../../../lib/types'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { fields, dataPoints } from './config'
import { validateDataPoints } from './config/dataPoints'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'

export const generateRandomNumber: Action<typeof fields, typeof settings> = {
  key: 'generateRandomNumber',
  title: 'Generate random number',
  description: 'Generate a random number between a given range.',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { min, max } = validateActionFields(payload.fields)

      const [minSerialized, maxSerialized] = [min, max].sort((a, b) => a - b)

      const generatedNumber =
        Math.floor(Math.random() * (maxSerialized - minSerialized + 1)) +
        minSerialized

      const { generatedNumber: validatedGeneratedNumber } = validateDataPoints({
        generatedNumber,
      })

      await onComplete({
        data_points: {
          generatedNumber: String(validatedGeneratedNumber),
        },
      })
    } catch (err) {
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

export type RandomNumberActivityPayload = NewActivityPayload<
  keyof typeof settings,
  keyof typeof fields
>
