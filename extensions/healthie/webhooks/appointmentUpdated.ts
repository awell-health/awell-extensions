import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../../awell/settings'
import { formatErrors } from '../lib/sdk/errors'
import { createSdk } from '../lib/sdk/createSdk'

const dataPoints = {
  updatedAppointmentId: {
    key: 'updatedAppointmentId',
    valueType: 'string',
  },
  appointment: {
    key: 'appointment',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'appointmentUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({settings})
      const updatedAppointmentId = payload.resource_id.toString()

      const response = await sdk.getAppointment({
        id: updatedAppointmentId,
      })
      const healthiePatientId = response?.data?.appointment?.user?.id
      await onSuccess({
        data_points: {
          updatedAppointmentId,
          appointment: JSON.stringify(response?.data?.appointment),
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      const formattedError = formatErrors(error)
      await onError(formattedError)
    } 
  },
}

export type AppointmentUpdated = typeof appointmentUpdated
