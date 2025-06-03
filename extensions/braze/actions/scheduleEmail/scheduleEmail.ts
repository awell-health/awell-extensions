import { isNil } from 'lodash'
import { Category, type Action } from '@awell-health/extensions-core'

import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'
import { addBooleanFieldIfDefined } from '../actionHelpers'
import { validateAndCreateClient } from '../../lib/validateAndCreateClient'

export const scheduleEmail = {
  key: 'scheduleEmail',
  title: 'Schedule Email',
  description: 'Schedule an email to be sent to a patient.',
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
        scheduleTime: time,
        inPatientLocalTime: in_local_time,
        atOptimalTime: at_optimal_time,
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
          ...(!isNil(message_variation_id) && {
            message_variation_id,
          }),
          ...(!isNil(reply_to) && {
            reply_to,
          }),
          ...addBooleanFieldIfDefined({ should_inline_css }),
        },
      },
    }

    const resp = await brazeClient.scheduleMessage(requestBody)

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
