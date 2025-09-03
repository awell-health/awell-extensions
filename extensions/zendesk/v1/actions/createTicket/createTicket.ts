import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import { type settings, SupportSettingsValidationSchema } from '../../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'
import { ZendeskSupportClient } from '../../client/support'

export const createTicket: Action<typeof fields, typeof settings> = {
  key: 'createTicket',
  title: 'Create ticket',
  description: 'Creates a new Zendesk Support ticket',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete) => {
    const {
      settings: { supportSubdomain, supportEmail, supportApiToken },
      fields: {
        external_id,
        tag,
        subject,
        comment,
        requester_email,
        requester_name,
      },
    } = validate({
      schema: z.object({
        settings: SupportSettingsValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const client = new ZendeskSupportClient({
      subdomain: supportSubdomain,
      email: supportEmail,
      apiToken: supportApiToken,
    })

    const res = await client.createTicket({
      external_id,
      tag,
      subject,
      comment,
      requester_email,
      requester_name,
    })

    await onComplete({
      data_points: {
        ticketId: String(res.id),
        ticketUrl: res.url,
        createdAt: res.created_at,
      },
    })
  },
}
