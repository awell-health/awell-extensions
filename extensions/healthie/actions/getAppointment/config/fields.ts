import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: 'The identifier of the appointment you want to retrieve.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>
