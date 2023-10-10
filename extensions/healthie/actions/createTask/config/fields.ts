import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Healthie patient ID',
    description: 'The ID of the patient related to this task.',
    type: FieldType.STRING,
  },
  assignToUserId: {
    id: 'assignToUserId',
    label: 'Assign to user',
    description:
      'The ID of the user to assign the task to. If none provided, will assign the task to the user the API key is associated with.',
    type: FieldType.STRING,
  },
  content: {
    id: 'content',
    label: 'Content',
    description: 'The content of the Task.',
    type: FieldType.TEXT,
    required: true,
  },
  dueDate: {
    id: 'dueDate',
    label: 'Due date',
    description: 'The due date of the task.',
    type: FieldType.DATE,
  },
  isReminderEnabled: {
    id: 'isReminderEnabled',
    label: 'Is reminder enabled',
    description: 'Would you like to send reminders for this task?',
    type: FieldType.BOOLEAN,
  },
  reminderIntervalType: {
    id: 'reminderIntervalType',
    label: 'Reminder interval type',
    description:
      'At what interval would you like to send reminders? The options are "daily", "weekly", "once".',
    type: FieldType.STRING,
  },
  reminderIntervalValue: {
    id: 'reminderIntervalValue',
    label: 'Reminder interval value (weekly)',
    description:
      'When interval type is set to "daily" or "once", leave this field blank. For "weekly" interval, send in comma separated all lower-case days of the week (e.g wednesday, friday).',
    type: FieldType.STRING,
    required: false,
  },
  reminderIntervalValueOnce: {
    id: 'reminderIntervalValueOnce',
    label: 'Reminder interval value (once)',
    description:
      'When the interval type is set to "daily" or "weekly", leave this field blank. For "once" interval, set or select a date.',
    type: FieldType.DATE,
    required: false,
  },
  reminderTime: {
    id: 'reminderTime',
    label: 'Reminder time',
    description:
      'Time to send the reminder. Expressed in the number of minutes from midnight.',
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>
