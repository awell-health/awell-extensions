import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { isNil } from 'lodash'
import { CmClient } from '../../../client'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS',
  description: 'Send a text message to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { productToken, fromName: defaultFromName },
        fields: { recipient, message, fromName },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          })
          .superRefine((value, ctx) => {
            // if both `from` values missing - throw error
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
          }),
        payload,
      })

      const client = new CmClient({
        productToken,
      })

      await client.sendSms({
        from: fromName ?? defaultFromName,
        to: recipient,
        message,
      })

      await onComplete()
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'BAD_REQUEST',
                message: error.message,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
