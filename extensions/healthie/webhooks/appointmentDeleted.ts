import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  deletedAppointmentId: {
    key: 'deletedAppointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'appointmentDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedAppointmentId } = payload

    if (isNil(deletedAppointmentId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedAppointmentId,
        },
      })
    }
  },
}

export type AppointmentDeleted = typeof appointmentDeleted
