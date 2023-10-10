import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { IterableClient } from '../../client'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Send an email to a specific email address.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      settings: { apiKey },
      fields: {
        campaignId,
        recipientEmail,
        recipientUserId,
        sendAt,
        dataFields,
        allowRepeatMarketingSends,
        metadata,
      },
    } = validate({
      schema: z.object({
        settings: SettingsValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const client = new IterableClient({
      apiKey,
    })

    await client.emailApi.sendEmail({
      campaignId,
      recipientEmail,
      recipientUserId,
      sendAt,
      dataFields,
      allowRepeatMarketingSends,
      metadata,
    })

    await onComplete()
  },
}
