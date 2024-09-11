import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../../healthie/settings'
import { formatError } from '../lib/sdk/graphql-codegen/errors'
import { createSdk } from '../lib/sdk/graphql-codegen/createSdk'
import { webhookPayloadSchema } from '../lib/helpers'

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
  async onEvent({ payload: { payload, settings }, onSuccess, onError }) {
    try {
      const { sdk } = await createSdk({ settings })

      const validatedPayload = webhookPayloadSchema.parse(payload)
      const updatedAppointmentId = validatedPayload.resource_id.toString()

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
      await onError(formatError(error))
    }
  },
}

export type AppointmentUpdated = typeof appointmentUpdated
