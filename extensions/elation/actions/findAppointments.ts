import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
  validate,
} from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../settings'
import { makeAPIClient } from '../client'
import { FindAppointmentFieldSchema } from '../validation/appointment.zod'
import { z } from 'zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    type: FieldType.NUMERIC,
    description: 'Patient ID',
  },
  physicianId: {
    id: 'physicianId',
    label: 'Physician ID',
    type: FieldType.NUMERIC,
    description: 'Physician ID',
    required: false,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    type: FieldType.NUMERIC,
    description: 'Practice ID',
    required: false,
  },
  from_date: {
    id: 'from_date',
    label: 'From Date',
    type: FieldType.DATE,
    description: 'Date from which to filter appointments',
  },
  to_date: {
    id: 'to_date',
    label: 'To date',
    type: FieldType.DATE,
    description: 'Date to which appointments are filtered',
    required: false,
  },
  event_type: {
    id: 'event_type',
    label: 'Event Type',
    type: FieldType.STRING,
    description: 'Event Type (`appointment` or leave empty)',
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointments: {
    key: 'appointments',
    valueType: 'json',
  },
  appointment_exists: {
    key: 'appointment_exists',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const findAppointments: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find Appointment',
  description:
    'Retrieve appointments for a given patient, physician, practice, and/or times',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        fields: FindAppointmentFieldSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const client = makeAPIClient(settings)
    const resp = await client.findAppointments(fields)

    await onComplete({
      data_points: {
        appointments: JSON.stringify(resp),
        appointment_exists: resp.length > 0 ? 'true' : 'false',
      },
    })
  },
}
