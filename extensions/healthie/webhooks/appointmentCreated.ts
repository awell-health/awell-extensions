import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'appointmentCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: appointmentId } = payload

    if (isNil(appointmentId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
      return
    }

    await onSuccess({
      data_points: {
        appointmentId,
      },
    })
  },
}

export type AppointmentCreated = typeof appointmentCreated
