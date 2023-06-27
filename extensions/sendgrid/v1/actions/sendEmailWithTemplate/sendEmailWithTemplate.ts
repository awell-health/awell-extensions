import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { FieldsValidationSchema } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import {
  mapSendgridErrorsToActivityErrors,
  ResponseError,
  SendgridClient,
} from '../../../client'

export const sendEmailWithTemplate: Action<typeof fields, typeof settings> = {
  key: 'sendEmailWithTemplate',
  title: 'Send email with template',
  description:
    'Send an email based on a template to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        patient: { id: patientId },
        activity: { id: activityId },
      } = payload

      const {
        fields: { to, subject, templateId, templateContent },
        settings: { apiKey, fromName, fromEmail },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const sendgridClient = new SendgridClient({ apiKey })
      await sendgridClient.mail.send({
        from: {
          email: fromEmail,
          name: fromName,
        },
        to,
        templateId,
        subject,
        dynamicTemplateData: {
          ...templateContent,
          // in template subject must be a handlebars variable
          subject,
        },
        // metadata
        customArgs: {
          website: 'https://awell.health',
          awellPatientId: patientId,
          awellActivityId: activityId,
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
      } else if (err instanceof ResponseError) {
        const events = mapSendgridErrorsToActivityErrors(err)

        await onError({
          events,
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
