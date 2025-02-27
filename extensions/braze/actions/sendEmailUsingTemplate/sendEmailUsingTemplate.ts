import { z } from 'zod'
import { isEmpty, isNil } from 'lodash'
import { Category, validate, type Action } from '@awell-health/extensions-core'

import { type settings, SettingsValidationSchema } from '../../settings'
import { BrazeClient } from '../../client'
import { fields, dataPoints, FieldsSchema } from './config'
import { addBooleanFieldIfDefined } from '../actionHelpers'

export const sendEmailUsingTemplate = {
  key: 'sendEmailUsingTemplate',
  title: 'Send Email Using Template',
  description:
    'Send an email to a patient using a template. You can schedule the email to be sent at a later time.',
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
        templateId: email_template_id,
        preheader,
        scheduleTime: time,
        inPatientLocalTime: in_local_time,
        atOptimalTime: at_optimal_time,
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

    const schedule = {
      ...(!isNil(time) && {
        time,
      }),
      ...addBooleanFieldIfDefined({ in_local_time }),
      ...addBooleanFieldIfDefined({ at_optimal_time }),
    }
    const requestBody = {
      external_user_ids: [externalUserId],
      ...(!isNil(campaign_id) && {
        campaign_id,
      }),
      ...(!isEmpty(schedule) && {
        schedule,
      }),
      messages: {
        email: {
          from,
          app_id,
          email_template_id,
          ...(!isNil(preheader) && {
            preheader,
          }),
          ...(!isNil(message_variation_id) && {
            message_variation_id,
          }),
          ...(!isNil(reply_to) && {
            reply_to,
          }),
        },
      },
    }

    const resp = isNil(time)
      ? await client.sendMessageImmediately(requestBody)
      : await client.scheduleMessage(requestBody)

    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: {
            en: `Email sent using template id ${email_template_id}. Response: ${JSON.stringify(
              resp,
            )}`,
          },
        },
      ],
      data_points: {
        EmailDispatchId: resp.dispatch_id,
      },
    })
  },
} satisfies Action<typeof fields, typeof settings>
