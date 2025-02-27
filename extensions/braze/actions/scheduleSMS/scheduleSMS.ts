import { z } from 'zod'
import { isNil } from 'lodash'
import { Category, validate, type Action } from '@awell-health/extensions-core'

import { type settings, SettingsValidationSchema } from '../../settings'
import { BrazeClient } from '../../client'
import { fields, dataPoints, FieldsSchema } from './config'

export const scheduleSMS = {
  key: 'scheduleSMS',
  title: 'Schedule SMS',
  description: 'Schedule an SMS to be sent immediateky to a patient.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const {
      fields: {
        subscriptionGroupId: subscription_group_id,
        externalUserId,
        body,
        appId: app_id,
        scheduleTime: time,
        inPatientLocalTime: in_local_time,
        atOptimalTime: at_optimal_time,
        linkShorteningEnabled: link_shortening_enabled,
        useClickTrackingEnabled: use_click_tracking_enabled,
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
      schedule: {
        time,
        ...(typeof in_local_time === 'boolean'
          ? {
              in_local_time,
            }
          : {}),
        ...(typeof at_optimal_time === 'boolean'
          ? {
              at_optimal_time,
            }
          : {}),
      },
      messages: {
        sms: {
          subscription_group_id,
          body,
          app_id,
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
    const resp = await client.scheduleMessage(requestBody)

    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: `SMS scheduled. Response: ${JSON.stringify(resp)}` },
        },
      ],
      data_points: {
        SMSScheduleId: resp.schedule_id,
        SMSDispatchId: resp.dispatch_id,
      },
    })
  },
} satisfies Action<typeof fields, typeof settings>
