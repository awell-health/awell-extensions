import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { type SubscriptionEvent } from '../types/subscription'
// not going to use these right now
const dataPoints = {
  id: {
    key: 'id',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const onCreatePatient: Webhook<
  keyof typeof dataPoints,
  SubscriptionEvent
> = {
  key: 'onCreatePatient',
  dataPoints,
  onWebhookReceived: async (evt) => {
    console.log(evt)
    return {
      data_points: { id: String(evt.event_id) },
    }
  },
}
