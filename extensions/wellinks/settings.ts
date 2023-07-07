import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  apiUrl: {
    key: 'apiUrl',
    label: 'Healthie API url',
    obfuscated: false,
    required: true,
    description: 'The environment specific API url.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'Healthie API key',
    obfuscated: true,
    required: true,
    description: 'Your Healthie API key.',
  },
  selectEventTypeQuestion: {
    key: 'selectEventTypeQuestion',
    label: 'Select Event Type Question ID',
    obfuscated: false,
    required: false,
    description:
      'The custom module ID of the question "Please select the event type"',
  },
  startSendingRemindersQuestions: {
    key: 'startSendingRemindersQuestions',
    label: 'Start Sending Reminders Question ID',
    obfuscated: false,
    required: false,
    description:
      'The custom module ID of the question "Start Sending Schedule Reminders On"',
  },
  memberEventFormId: {
    key: 'memberEventFormId',
    label: 'Member Event Form ID',
    obfuscated: false,
    required: false,
    description: 'The form ID of the Healthie Member Event Form',
  },
  sendgridApiUrl: {
    key: 'sendgridApiUrl',
    label: 'Sendgrid API url',
    obfuscated: false,
    required: true,
    description: 'The environment specific Sendgrid API url.',
  },
  sendgridApiKey: {
    key: 'sendgridApiKey',
    label: 'Sendgrid API key',
    obfuscated: true,
    required: true,
    description: 'Your Sendgrid API key.',
  },
} satisfies Record<string, Setting>
