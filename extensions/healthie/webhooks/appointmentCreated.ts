import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
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
  .transform((data) => {
    return {
      appointmentId: data.resource_id,
    }
  })

export const appointmentCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'appointmentCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { appointmentId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getAppointment({
      id: appointmentId,
    })
    await onSuccess({
      data_points: {
        appointmentId,
        appointment: JSON.stringify(response?.data?.appointment),
      },
    })
  },
}

export type AppointmentCreated = typeof appointmentCreated
