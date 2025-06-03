import { isNil } from 'lodash'
import { Category, type Action } from '@awell-health/extensions-core'

import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'
import { addBooleanFieldIfDefined } from '../actionHelpers'
import { validateAndCreateClient } from '../../lib/validateAndCreateClient'

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
      brazeClient,
      appId,
      fields: {
        subscriptionGroupId: subscription_group_id,
        externalUserId,
        body,
        scheduleTime: time,
        inPatientLocalTime: in_local_time,
        atOptimalTime: at_optimal_time,
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
      schedule: {
        time,
        ...addBooleanFieldIfDefined({ in_local_time }),
        ...addBooleanFieldIfDefined({ at_optimal_time }),
      },
      messages: {
        sms: {
          subscription_group_id,
          body,
          app_id: appId,
          ...(!isNil(message_variation_id) && {
            message_variation_id,
          }),
          ...addBooleanFieldIfDefined({ link_shortening_enabled }),
          ...addBooleanFieldIfDefined({
            use_click_tracking_enabled,
          }),
        },
      },
    }
    const resp = await brazeClient.scheduleMessage(requestBody)

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
