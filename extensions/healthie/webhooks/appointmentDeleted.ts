import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      deletedAppointmentId: data.resource_id,
    }
  })

const dataPoints = {
  deletedAppointmentId: {
    key: 'deletedAppointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'appointmentDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { deletedAppointmentId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getAppointment({
      id: deletedAppointmentId,
      include_deleted: true,
    })
    const healthiePatientId = response?.data?.appointment?.user?.id
    await onSuccess({
      data_points: {
        deletedAppointmentId,
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

export type AppointmentDeleted = typeof appointmentDeleted
