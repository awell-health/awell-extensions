import { z, ZodError } from 'zod'
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

const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: 'The appointment ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointment_data: {
    key: 'appointment_data',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Appointment',
  description: 'Retrieve an appointment',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const appointmentId = z.string().parse(payload.fields.appointmentId)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const appointment = await api.getTask(appointmentId)
      await onComplete({
        data_points: {
          appointment_data: JSON.stringify(appointment),
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
                category: 'WRONG_INPUT',
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
                category: 'SERVER_ERROR',
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
