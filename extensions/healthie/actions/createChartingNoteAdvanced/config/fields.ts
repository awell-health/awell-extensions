import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
    healthie_patient_id: {
        id: 'healthie_patient_id',
        label: 'Healthie Patient ID',
        description:
            'The ID of the patient you would like to create a charting note for.',
        type: FieldType.STRING,
        required: true,
    },
    form_id: {
        id: 'form_id',
        label: 'Form ID',
        description:
            'The ID of the form you would like to create the charting note against.',
        type: FieldType.STRING,
        required: true,
    },
    note_content: {
        id: 'note_content',
        label: 'Note content',
        description: 'The json content of the charting note.',
        type: FieldType.JSON,
        required: true,
    },
    marked_locked: {
        id: 'marked_locked',
        label: 'Mark as locked?',
        description: 'This field allows you to mark the content as locked.',
        type: FieldType.BOOLEAN,
        required: false,
    },
    appointment_id: {
        id: 'appointment_id',
        label: 'Appointment ID',
        description:
            'The ID of the appointment you would like the charting note associated with.',
        type: FieldType.STRING,
        required: false,
    },
} satisfies Record<string, Field>
