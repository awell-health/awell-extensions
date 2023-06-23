/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { appointmentWithIdSchema } from '../validation/dto/appointment.zod'

const fields = {
  appointment_data: {
    id: 'appointment_data',
    label: 'Appointment data',
    description: 'Appointment data',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const updateAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updateAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Appointment',
  description: 'Update an appointment',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const appointment = appointmentWithIdSchema.parse(
        payload.fields.appointment_data
      )

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      await api.updateAppointment(appointment)
      await onComplete()
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
