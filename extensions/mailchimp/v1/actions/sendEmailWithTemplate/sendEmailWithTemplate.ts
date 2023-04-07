import { type Action } from '../../../../../lib/types'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { validateSettings, type settings } from '../../../settings'
import mailchimpSdk from '../../../common/sdk/mailchimpSdk'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'

export const sendEmailWithTemplate: Action<typeof fields, typeof settings> = {
  key: 'sendEmailWithTemplate',
  title: 'Send email with template',
  description: 'Send an email based on a template.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        patient: { id: patientId },
        activity: { id: activityId },
      } = payload

      const { to, subject, templateName, templateContent } =
        validateActionFields(payload.fields)
      const { apiKey, fromName, fromEmail } = validateSettings(payload.settings)

      const apiClient = mailchimpSdk(apiKey)

      await apiClient.messages.sendTemplate({
        template_name: templateName,
        template_content: templateContent,
        message: {
          from_email: fromEmail,
          from_name: fromName,
          to: [{ email: to }],
          subject,
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
        console.log(error.message)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
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
