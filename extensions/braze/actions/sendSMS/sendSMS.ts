import { z } from 'zod'
import { isNil } from 'lodash'
import { Category, validate, type Action } from '@awell-health/extensions-core'

import { type settings, SettingsValidationSchema } from '../../settings'
import { BrazeClient } from '../../client'
import { fields, dataPoints, FieldsSchema } from './config'

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
      fields: {
        subscriptionGroupId,
        externalUserId,
        body,
        appId,
        linkShorteningEnabled,
        useClickTrackingEnabled,
        campaignId,
        messageVariantionId,
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
      campaign_id: campaignId,
      messages: {
        sms: {
          subscription_group_id: subscriptionGroupId,
          body,
          app_id: appId,
          ...(!isNil(messageVariantionId) && {
            message_variation_id: messageVariantionId,
          }),
          ...(typeof linkShorteningEnabled === 'boolean' && {
            link_shortening_enabled: linkShorteningEnabled,
          }),
          ...(typeof useClickTrackingEnabled === 'boolean' && {
            use_click_tracking_enabled: useClickTrackingEnabled,
          }),
        },
      },
    }

    const resp = await client.sendMessageImmediately(requestBody)

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
