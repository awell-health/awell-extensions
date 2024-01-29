import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient in Healthie.',
    type: FieldType.STRING,
  },
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment type ID',
    description: 'The ID of the appointment type.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
