import { type Action } from '@awell-health/extensions-core'
import { dataPoints, fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'

export const arrayTest: Action<typeof fields, typeof settings> = {
  key: 'arrayTest',
  title: 'Array fields test',
  description: 'Just to show string and numeric array fields',
  category: Category.DEMO,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        stringArray,
        anotherStringArray,
        numericArray,
        anotherNumericArray,
      } = validateActionFields(payload.fields)

      const strings = [...stringArray, ...anotherStringArray]
      console.log('🚀 ~ onActivityCreated: ~ strings:', strings)
      const numbers = [...numericArray, ...anotherNumericArray]
      console.log('🚀 ~ onActivityCreated: ~ numbers:', numbers)

      await onComplete({
        data_points: {
          allStrings: JSON.stringify(strings),
          allNumbers: JSON.stringify(numbers),
        },
      })
    } catch (err) {
      console.log('error', err)
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
            text: { en: 'Something went wrong while orchestrating the action' },
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
