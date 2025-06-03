import { isNil } from 'lodash'
import { Category, type Action } from '@awell-health/extensions-core'

import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'
import { validateAndCreateClient } from '../../lib/validateAndCreateClient'

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
      brazeClient,
      fields: {
        externalUserId: external_user_id,
        sendId: send_id,
        email,
        campaignId: campaign_id,
        triggerProperties: trigger_properties,
        attributes,
      },
    } = await validateAndCreateClient({
      fieldsSchema: FieldsSchema,
      payload,
      requiresAppId: false, // Sending a campaign doesn't require an app ID to be set
    })

    if (isNil(external_user_id) && isNil(email)) {
      throw new Error('Either externalUserId or email must be provided.')
    }

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

    const resp = await brazeClient.sendCampaign(requestBody)

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
