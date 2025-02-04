import { type Timer } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { type ElationWebhookPayload } from './types'

export const labOrderSigned: Timer = {
  type: 'resource_updated',
  key: 'lab_order.signed',
  action_key: 'createLabOrder',
  description: 'Wait for lab order to be signed',
  resource_id: {
    type: 'extension_data_point',
    key: 'labOrderId',
  },
  evaluate: (input: unknown) => {
    const payload = input as ElationWebhookPayload
    const { data: labOrder, action } = payload
    return (
      action === 'saved' &&
      payload.resource === 'lab_orders' &&
      !isNil(labOrder.signed_by) &&
      !isNil(labOrder.signed_date)
    )
  },
  extractResourceId: (input: unknown) => {
    const payload = input as ElationWebhookPayload
    return payload.data.id
  },
}
