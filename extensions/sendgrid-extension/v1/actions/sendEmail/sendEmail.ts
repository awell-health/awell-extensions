import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { FieldsValidationSchema } from './config/fields'
import { z } from 'zod'
import {
  mapSendgridErrorsToActivityErrors,
  ResponseError,
  SendgridClient,
} from '../../../client'
import { isNil } from 'lodash'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Send an email.',
  category: Category.COMMUNICATION,
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        patient: { id: patientId },
        activity: { id: activityId },
      } = payload

      const {
        fields: { to, subject, body, fromName, fromEmail },
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
        subject,
        html: body,
        // metadata
        customArgs: {
          website: 'https://awell.health',
          awellPatientId: patientId,
          awellActivityId: activityId,
        },
      })

      await onComplete()
    } catch (err) {
      if (err instanceof ResponseError) {
        const events = mapSendgridErrorsToActivityErrors(err)

        await onError({
          events,
        })
      } else {
        /**
         * re-throw to be handled inside awell-extension-server
         */
        throw err
      }
    }
  },
}
