import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { infobipErrorToActivityEvent, isInfobipError } from '../../client/error'
import { InfobipClient } from '../../client'

export const sendEmailWithTemplate: Action<typeof fields, typeof settings> = {
  key: 'sendEmailWithTemplate',
  title: 'Send email with template',
  description: 'Sends email with a template using Infobip',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { baseUrl, apiKey },
        fields: { to, subject, templateId, placeholders },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new InfobipClient({ baseUrl, apiToken: apiKey })

      await client.emailApi.send({
        to: [to],
        subject,
        templateId,
        defaultPlaceholders: JSON.stringify(placeholders),
      })

      await onComplete()
    } catch (err) {
      if (isInfobipError(err)) {
        const events = infobipErrorToActivityEvent(err)
        await onError({ events })
      } else {
        // re-throw to be handled in extensions server
        throw err
      }
    }
  },
}
