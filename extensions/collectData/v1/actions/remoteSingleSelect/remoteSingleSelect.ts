import { type Action } from '@awell-health/extensions-core'
import { dataPoints, fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'

export const remoteSingleSelect: Action<typeof fields, typeof settings> = {
  key: 'remoteSingleSelect',
  title: 'Dynamic choice selector',
  description:
    'The dynamic choice selector allow you to set up a select question where the available choices are dynamically populated through an API lookup',
  category: Category.FORMS,
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validateActionFields(payload.fields)

      /**
       * Completion happens in Awell Hosted Pages
       */
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
