import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { type TicketCreatedWebhookPayload } from './types'

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const ticketCreated: Webhook<
  keyof typeof dataPoints,
  TicketCreatedWebhookPayload,
  typeof settings
> = {
  key: 'ticketCreated',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    await onSuccess({
      data_points: {},
    })
  },
}

export type TicketCreated = typeof ticketCreated
