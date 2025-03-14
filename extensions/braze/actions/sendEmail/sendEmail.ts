import { z } from 'zod'
import { isNil } from 'lodash'
import { Category, validate, type Action } from '@awell-health/extensions-core'

import { type settings, SettingsValidationSchema } from '../../settings'
import { BrazeClient } from '../../client'
import { fields, dataPoints, FieldsSchema } from './config'

export const sendEmail = {
  key: 'sendEmail',
  title: 'Send Email',
  description: 'Send an email to a patient.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const {
      fields: {
        externalUserId,
        appId: app_id,
        from,
        replyTo: reply_to,
        subject,
        body,
        preheader,
        shouldInlineCss: should_inline_css,
        campaignId: campaign_id,
        messageVariantionId: message_variation_id,
      },
      settings: { apiKey, baseUrl },
    } = validate({
      schema: z.object({
        fields: FieldsSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const client = new BrazeClient({ apiKey, baseUrl })

    const requestBody = {
      external_user_ids: [externalUserId],
      ...(!isNil(campaign_id) && {
        campaign_id,
      }),
      messages: {
        email: {
          from,
          body,
          app_id,
          ...(!isNil(subject) && {
            subject,
          }),
          ...(!isNil(preheader) && {
            preheader,
          }),
          ...(typeof should_inline_css === 'boolean'
            ? {
                should_inline_css,
              }
            : {}),
          ...(!isNil(message_variation_id) && {
            message_variation_id,
          }),
          ...(!isNil(reply_to) && {
            reply_to,
          }),
        },
      },
    }

    const resp = await client.sendMessageImmediately(requestBody)

    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: `Email sent. Response: ${JSON.stringify(resp)}` },
        },
      ],
      data_points: {
        EmailDispatchId: resp.dispatch_id,
      },
    })
  },
} satisfies Action<typeof fields, typeof settings>
