import { createHash } from 'crypto'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints } from './config'
import { FieldsValidationSchema } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const assignToCohort: Action<typeof fields, typeof settings> = {
  key: 'assignToCohort',
  title: 'Assign to cohort',
  description:
    'Deterministically assign a value to a cohort number. Given the same input and number of cohorts, the result will always be the same.',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        fields: { input, numberOfCohorts },
      } = validate({
        schema: z.object({ fields: FieldsValidationSchema }),
        payload,
      })

      const hash = createHash('sha256').update(input).digest('hex')
      const hashInt = parseInt(hash.substring(0, 8), 16)
      const cohortNumber = (hashInt % numberOfCohorts) + 1

      await onComplete({
        data_points: {
          cohortNumber: String(cohortNumber),
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
