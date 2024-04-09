import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type CalComWebhookPayload } from '../types'

const dataPoints = {
  bookingId: {
    key: 'bookingId',
    valueType: 'string',
  },
  bookingUid: {
    key: 'bookingUid',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const bookingRescheduled: Webhook<
  keyof typeof dataPoints,
  CalComWebhookPayload
> = {
  key: 'bookingRescheduled',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      payload: { bookingId, uid },
    } = payload

    if (isNil(bookingId) || isNil(uid)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          bookingId: String(bookingId),
          bookingUid: uid,
        },
      })
    }
  },
}

export type BookingRescheduled = typeof bookingRescheduled
