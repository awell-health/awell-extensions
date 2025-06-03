import { isNil } from 'lodash'
import { Category, type Action } from '@awell-health/extensions-core'

import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'
import { validateAndCreateClient } from '../../lib/validateAndCreateClient'

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
      brazeClient,
      appId,
      fields: {
        externalUserId,
        from,
        replyTo: reply_to,
        subject,
        body,
        preheader,
        shouldInlineCss: should_inline_css,
        campaignId: campaign_id,
        messageVariantionId: message_variation_id,
      },
    } = await validateAndCreateClient({
      fieldsSchema: FieldsSchema,
      payload,
    })

    const requestBody = {
      external_user_ids: [externalUserId],
      ...(!isNil(campaign_id) && {
        campaign_id,
      }),
      messages: {
        email: {
          from,
          body,
          app_id: appId,
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

    const resp = await brazeClient.sendMessageImmediately(requestBody)

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
