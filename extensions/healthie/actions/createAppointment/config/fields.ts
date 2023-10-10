import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The ID of the patient you want to create an appointment for.',
    type: FieldType.STRING,
    required: true,
  },
  otherPartyId: {
    id: 'otherPartyId',
    label: 'Provider ID',
    description:
      'The ID of the provider the appointment is with. If none provided, the user the API key is associated with will be used.',
    type: FieldType.STRING,
  },
  contactTypeId: {
    id: 'contactTypeId',
    label: 'Contact type ID',
    description: 'How the appointment will be conducted.',
    type: FieldType.STRING,
    required: true,
  },
  appointmentTypeId: {
    id: 'appointmentTypeId',
    label: 'Appointment type ID',
    description: 'The ID of the appointment type.',
    type: FieldType.STRING,
    required: true,
  },
  datetime: {
    id: 'datetime',
    label: 'Appointment date and time',
    description: 'The date and time of the appointment in ISO8601 format.',
    type: FieldType.DATE,
    required: true,
  },
} satisfies Record<string, Field>
