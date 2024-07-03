import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../../awell/settings'

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

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((d) => {
    return {
      updatedAppointmentId: d.resource_id,
    }
  })

export const appointmentUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'appointmentUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { updatedAppointmentId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payload,
      payloadSchema,
      settings,
    })
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
  },
}

export type AppointmentUpdated = typeof appointmentUpdated
