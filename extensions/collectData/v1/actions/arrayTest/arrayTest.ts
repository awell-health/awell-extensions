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
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    try {
      const {
        stringArray,
        anotherStringArray,
        numericArray,
        anotherNumericArray,
      } = validateActionFields(payload.fields)

      const strings = [...stringArray, ...anotherStringArray]
      helpers.log({ strings }, '🚀 ~ onActivityCreated: ~ strings:')
      const numbers = [...numericArray, ...anotherNumericArray]
      helpers.log({ numbers }, '🚀 ~ onActivityCreated: ~ numbers:')

      await onComplete({
        data_points: {
          allStrings: JSON.stringify(strings),
          allNumbers: JSON.stringify(numbers),
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
