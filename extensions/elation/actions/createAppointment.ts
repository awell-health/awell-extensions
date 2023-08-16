/* eslint-disable @typescript-eslint/naming-convention */
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { appointmentSchema } from '../validation/appointment.zod'

const fields = {
  scheduledDate: {
    id: 'scheduledDate',
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
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: '',
    type: FieldType.NUMERIC,
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
      'Number (in minutes). Must be a multiple of 5 and between 1 to 1440.',
    type: FieldType.NUMERIC,
  },
  description: {
    id: 'description',
    label: 'Description',
    description: 'Maximum length of 500 characters.',
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
      /**
       * put action/extension specific errors there
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
