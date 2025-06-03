import { isEmpty, isNil } from 'lodash'
import { Category, type Action } from '@awell-health/extensions-core'

import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'
import { addBooleanFieldIfDefined } from '../actionHelpers'
import { validateAndCreateClient } from '../../lib/validateAndCreateClient'

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
      brazeClient,
      appId,
      fields: {
        externalUserId,
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
    } = await validateAndCreateClient({
      fieldsSchema: FieldsSchema,
      payload,
    })

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
          app_id: appId,
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
      ? await brazeClient.sendMessageImmediately(requestBody)
      : await brazeClient.scheduleMessage(requestBody)

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
