import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  updatedAppointmentId: {
    key: 'updatedAppointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'appointmentUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: updatedAppointmentId } = payload

    if (isNil(updatedAppointmentId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    await onSuccess({
      data_points: {
        updatedAppointmentId,
      },
    })
  },
}

export type AppointmentUpdated = typeof appointmentUpdated
