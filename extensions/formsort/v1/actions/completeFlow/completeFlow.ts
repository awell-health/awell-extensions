import { type Action } from '../../../../../lib/types'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'

export const completeFlow: Action<typeof fields, typeof settings> = {
  key: 'completeFlow',
  title: 'Complete flow',
  description: 'Let a stakeholder complete a Formsort flow.',
  category: Category.FORMS,
  fields,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validateActionFields(payload.fields)
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
