import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  healthie_patient_id: {
    id: 'healthie_patient_id',
    label: 'Healthie Patient ID',
    description:
      'The ID of the patient that should receive the form completion request.',
    type: FieldType.STRING,
    required: true,
  },
  form_id: {
    id: 'form_id',
    label: 'Form ID',
    description: 'The ID of the form you would like the patient to complete.',
    type: FieldType.STRING,
    required: true,
  },
  is_recurring: {
    id: 'is_recurring',
    label: 'Is recurring',
    description: 'Set to true if the Form completion should be recurring.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  frequency: {
    id: 'frequency',
    label: 'Frequency',
    description:
      'Required if "Is recurring" is set to true. Valid options are: Daily, Weekly, Monthly.',
    type: FieldType.STRING,
    required: false,
  },
  period: {
    id: 'period',
    label: 'Period',
    description: 'AM or PM.',
    type: FieldType.STRING,
    required: false,
  },
  hour: {
    id: 'hour',
    label: 'Hour',
    description:
      'For instance, if you want to trigger the completion request at 1:05 PM, use "1".',
    type: FieldType.NUMERIC,
    required: false,
  },
  minute: {
    id: 'minute',
    label: 'Minute',
    description:
      'For instance, if you want to trigger the completion request at 1:05 PM, use "5".',
    type: FieldType.NUMERIC,
    required: false,
  },
  weekday: {
    id: 'weekday',
    label: 'Weekday',
    description: 'Use the full weekday name, e.g. "Monday".',
    type: FieldType.STRING,
    required: false,
  },
  monthday: {
    id: 'monthday',
    label: 'Monthday',
    description: 'Number of the day of month, e.g. "27th".',
    type: FieldType.STRING,
    required: false,
  },
  ends_on: {
    id: 'ends_on',
    label: 'Ends on',
    description: 'Recurrence end date in the YYYY-MM-DD format.',
    type: FieldType.DATE,
    required: false,
  },
} satisfies Record<string, Field>
