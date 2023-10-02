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
import { appointmentSchema } from '../validation/appointment.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient to book the appointment for',
    type: FieldType.NUMERIC,
    required: true,
  },
  scheduledDate: {
    id: 'scheduledDate',
    label: 'Scheduled date',
    description: 'Needs to be an ISO8601 string',
    type: FieldType.DATE,
    required: true,
  },
  reason: {
    id: 'reason',
    label: 'Reason',
    description: 'Should be one of the valid appointment types in Elation',
    type: FieldType.STRING,
    required: true,
  },
  physicianId: {
    id: 'physicianId',
    label: 'Physician ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    description: '',
    type: FieldType.NUMERIC,
    required: true,
  },
  duration: {
    id: 'duration',
    label: 'Duration',
    description:
      'Number (in minutes). Must be a multiple of 5, the default duration is 15 minutes',
    type: FieldType.NUMERIC,
  },
  description: {
    id: 'description',
    label: 'Description',
    description: '',
    type: FieldType.STRING,
  },
  serviceLocationId: {
    id: 'serviceLocationId',
    label: 'Service location ID',
    description: '',
    type: FieldType.NUMERIC,
  },
  telehealthDetails: {
    id: 'telehealthDetails',
    label: 'Telehealth details',
    description: '',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const createAppointment: Action<
  typeof fields,
  typeof settings,
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
      const {
        scheduledDate,
        patientId,
        physicianId,
        practiceId,
        serviceLocationId,
        telehealthDetails,
        ...fields
      } = payload.fields
      const appointment = appointmentSchema.parse({
        ...fields,
        scheduled_date: scheduledDate,
        patient: patientId,
        physician: physicianId,
        practice: practiceId,
        service_location: serviceLocationId,
        telehealth_details: telehealthDetails,
      })

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
