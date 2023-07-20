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
import { isNil } from 'lodash'

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
        fields: {
          to,
          subject,
          templateId,
          dynamicTemplateData,
          fromName,
          fromEmail,
        },
        settings: {
          apiKey,
          fromName: defaultFromName,
          fromEmail: defaultFromEmail,
        },
      } = validate({
        schema: z
          .object({
            fields: FieldsValidationSchema,
            settings: SettingsValidationSchema,
          })
          .superRefine((value, ctx) => {
            // if both `fromName` values missing - throw error
            if (
              isNil(value.settings.fromName) &&
              isNil(value.fields.fromName)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message:
                  '"fromName" is missing in both settings and in the action field.',
              })
            }

            // if both `fromEmail` values missing - throw error
            if (
              isNil(value.settings.fromEmail) &&
              isNil(value.fields.fromEmail)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message:
                  '"fromEmail" is missing in both settings and in the action field.',
              })
            }
          }),
        payload,
      })

      const emailSubject = Object.prototype.hasOwnProperty.call(
        dynamicTemplateData,
        'subject'
      )
        ? String(dynamicTemplateData.subject)
        : subject

      const sendgridClient = new SendgridClient({ apiKey })
      await sendgridClient.mail.send({
        from: {
          /**
           * '' default needs to be provided for TypeScript
           * in reality it will throw validation error above if it's not provided
           * */
          email: fromEmail ?? defaultFromEmail ?? '',
          name: fromName ?? defaultFromName ?? '',
        },
        to,
        templateId,
        subject: emailSubject,
        dynamicTemplateData: {
          ...dynamicTemplateData,
          // in template subject must be a handlebars variable
          subject: emailSubject,
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
