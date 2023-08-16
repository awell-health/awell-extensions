import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { isNil } from 'lodash'
import { CmClient, isSmsError, smsErrorToActivityEvent } from '../../../client'

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
        activity: { id: activityId },
      } = payload
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
        // default only for TypeScript check, in reality error will be thrown if both empty
        from: fromName ?? defaultFromName ?? '',
        to: recipient,
        message,
        reference: activityId,
      })

      await onComplete()
    } catch (err) {
      if (isSmsError(err)) {
        const events = smsErrorToActivityEvent(err)
        await onError({ events })
      } else {
        /**
         * re-throw to be handled inside awell-extension-server
         */
        throw err
      }
    }
  },
}
