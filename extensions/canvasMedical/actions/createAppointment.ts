/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  type Fields,
  FieldType,
  type Action,
  type DataPointDefinition,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { appointmentSchema } from '../validation/dto/appointment.zod'
import type schemas from '../schemas'

const fields = {
  appointment_data: {
    id: 'appointment_data',
    label: 'Appointment data',
    description: 'Appointment data',
    type: FieldType.JSON,
    jsonType: 'canvas_appointment',
    required: true,
  },
} satisfies Fields<typeof schemas>

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'createAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Appointment',
  description: 'Create an appointment',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const appointment = appointmentSchema.parse(
        JSON.parse(payload.fields.appointment_data as string)
      )

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const { id } = await api.createAppointment(appointment)
      await onComplete({
        data_points: {
          appointmentId: String(id),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'SERVER_ERROR',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'BAD_REQUEST',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
