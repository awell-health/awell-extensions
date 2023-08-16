import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { FieldsValidationSchema } from './config/fields'
import { z } from 'zod'
import mailchimpSdk from '../../../common/sdk/mailchimpSdk'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Send an email.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      patient: { id: patientId },
      activity: { id: activityId },
    } = payload

    const {
      fields: { to, subject, body },
      settings: { apiKey, fromName, fromEmail },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

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
  },
}
