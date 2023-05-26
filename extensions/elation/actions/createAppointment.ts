/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  Category,
  type DataPointDefinition,
  type Field,
} from '@awell-health/awell-extensions-types'
import { makeAPIClient } from '../clientUtils'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { appointmentSchema } from '../validation/appointment.zod'
import type { ElationAction } from '../types/action'

const fields = {
  scheduled_date: {
    id: 'scheduled_date',
    label: 'Scheduled date',
    description: 'Datetime (ISO8601).',
    type: FieldType.STRING,
    required: true,
  },
  reason: {
    id: 'reason',
    label: 'Reason',
    description:
      'Should not be free-text. The values are mapped to "appointment types" in the EMR. Maximum length of 50 characters.',
    type: FieldType.STRING,
    required: true,
  },
  patient: {
    id: 'patient',
    label: 'Patient',
    description: 'Patient ID',
    type: FieldType.STRING,
    required: true,
  },
  physician: {
    id: 'physician',
    label: 'Physician',
    description: 'Physician ID',
    type: FieldType.STRING,
    required: true,
  },
  practice: {
    id: 'practice',
    label: 'Practice',
    description: 'Practice ID',
    type: FieldType.STRING,
    required: true,
  },
  duration: {
    id: 'duration',
    label: 'Duration',
    description:
      'Number (in minutes). Must be a multiple of 5 and between 1 to 1440.',
    type: FieldType.STRING,
  },
  description: {
    id: 'description',
    label: 'Description',
    description: 'Maximum length of 500 characters.',
    type: FieldType.STRING,
  },
  service_location: {
    id: 'service_location',
    label: 'Service location',
    description: 'Service location ID',
    type: FieldType.STRING,
  },
  telehealth_details: {
    id: 'telehealth_details',
    label: 'Telehealth details',
    description: '',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createAppointment: ElationAction<
  typeof fields,
  keyof typeof dataPoints
> = {
  key: 'createAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Appointment',
  description: "Create an appointment using Elation's scheduling API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const appointment = appointmentSchema.parse(payload.fields)
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
