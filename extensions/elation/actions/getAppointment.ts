import {
  FieldType,
  NumericIdSchema,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'

const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description:
      'Provide the ID of the appointment you want to fetch the details of',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  scheduledDate: {
    key: 'scheduledDate',
    valueType: 'date',
  },
  reason: {
    key: 'reason',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'number',
  },
  physicianId: {
    key: 'physicianId',
    valueType: 'number',
  },
  practiceId: {
    key: 'practiceId',
    valueType: 'number',
  },
  duration: {
    key: 'duration',
    valueType: 'number',
  },
  description: {
    key: 'description',
    valueType: 'string',
  },
  serviceLocationId: {
    key: 'serviceLocationId',
    valueType: 'number',
  },
  telehealthDetails: {
    key: 'telehealthDetails',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'json',
  },
  appointment: {
    key: 'appointment',
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
  description: "Retrieve an appointment using Elation's scheduling API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const appointmentId = NumericIdSchema.parse(payload.fields.appointmentId)

    // API Call should produce AuthError or something dif.
    const api = makeAPIClient(payload.settings)
    const appointment = await api.getAppointment(appointmentId)
    await onComplete({
      data_points: {
        scheduledDate: appointment.scheduled_date,
        reason: appointment.reason,
        patientId: String(appointment.patient),
        physicianId: String(appointment.physician),
        practiceId: String(appointment.practice),
        duration: String(appointment.duration),
        description: appointment.description,
        serviceLocationId: String(appointment.service_location?.id),
        telehealthDetails: appointment.telehealth_details,
        status: JSON.stringify(appointment.status),
        appointment: JSON.stringify(appointment),
      },
    })
  },
}
