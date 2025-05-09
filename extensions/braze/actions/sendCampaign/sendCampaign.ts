import { z } from 'zod'
import { isNil } from 'lodash'
import { Category, validate, type Action } from '@awell-health/extensions-core'

import { type settings, SettingsValidationSchema } from '../../settings'
import { BrazeClient } from '../../client'
import { fields, dataPoints, FieldsSchema } from './config'

export const sendCampaign = {
  key: 'sendCampaign',
  title: 'Send campaign',
  description: 'Send a campaign with Braze',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const {
      fields: {
        externalUserId: external_user_id,
        sendId: send_id,
        email,
        campaignId: campaign_id,
        triggerProperties: trigger_properties,
        attributes,
      },
      settings: { apiKey, baseUrl },
    } = validate({
      schema: z.object({
        fields: FieldsSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    if (isNil(external_user_id) && isNil(email)) {
      throw new Error('Either externalUserId or email must be provided.')
    }

    const client = new BrazeClient({ apiKey, baseUrl })

    const requestBody = {
      campaign_id,
      recipients: [
        {
          ...(!isNil(external_user_id) && {
            external_user_id,
          }),
          ...(!isNil(email) && {
            email,
          }),
          ...(!isNil(trigger_properties) && {
            trigger_properties,
          }),
          ...(!isNil(attributes) && {
            attributes,
          }),
        },
      ],
      ...(!isNil(send_id) && {
        send_id,
      }),
    }

    const resp = await client.sendCampaign(requestBody)

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
