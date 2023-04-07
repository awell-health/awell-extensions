import { type Action } from '../../../../../lib/types'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { validateSettings, type settings } from '../../../settings'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import mailchimpSdk from '../../../common/sdk/mailchimpSdk'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Send an email.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        patient: { id: patientId },
        activity: { id: activityId },
      } = payload

      const { to, subject, body } = validateActionFields(payload.fields)
      const { apiKey, fromName, fromEmail } = validateSettings(payload.settings)

      const apiClient = mailchimpSdk(apiKey)

      await apiClient.messages.send({
        message: {
          from_email: fromEmail,
          from_name: fromName,
          to: [{ email: to }],
          subject,
          html: body,
          metadata: {
            website: 'https://awell.health',
            awellPatientId: patientId,
            awellActivityId: activityId,
          },
        },
      })

      await onComplete()
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
