import { isNil } from 'lodash'
import { Category, type Action } from '@awell-health/extensions-core'

import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'
import { validateAndCreateClient } from '../../lib/validateAndCreateClient'

export const sendSMS = {
  key: 'sendSMS',
  title: 'Send SMS',
  description: 'Send an SMS to a patient.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const {
      brazeClient,
      appId,
      fields: {
        subscriptionGroupId: subscription_group_id,
        externalUserId,
        body,
        linkShorteningEnabled: link_shortening_enabled,
        useClickTrackingEnabled: use_click_tracking_enabled,
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
        sms: {
          subscription_group_id,
          body,
          app_id: appId,
          ...(!isNil(message_variation_id) && {
            message_variation_id,
          }),
          ...(typeof link_shortening_enabled === 'boolean'
            ? {
                link_shortening_enabled,
              }
            : {}),
          ...(typeof use_click_tracking_enabled === 'boolean'
            ? {
                use_click_tracking_enabled,
              }
            : {}),
        },
      },
    }

    const resp = await brazeClient.sendMessageImmediately(requestBody)

    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: `SMS sent. Response: ${JSON.stringify(resp)}` },
        },
      ],
      data_points: {
        SMSDispatchId: resp.dispatch_id,
      },
    })
  },
} satisfies Action<typeof fields, typeof settings>
