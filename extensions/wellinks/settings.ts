import { type Setting } from "../../lib/types"

export const settings = {
    apiUrl: {
        key: 'apiUrl',
        label: 'API url',
        obfuscated: false,
        required: true,
        description: 'The environment specific API url.',
      },
      apiKey: {
        key: 'apiKey',
        label: 'API key',
        obfuscated: true,
        required: true,
        description: 'Your Healthie API key.',
      },
      selectEventTypeQuestion: {
        key: 'selectEventTypeQuestion',
        label: 'Select Event Type Question ID',
        obfuscated: true,
        required: true,
        description: 'The custom module ID of the question "Please select the event type"',
      },
      startSendingRemindersQuestions: {
        key: 'startSendingRemindersQuestions',
        label: 'Start Sending Reminders Question ID',
        obfuscated: true,
        required: true,
        description: 'The custom module ID of the question "Start Sending Schedule Reminders On"',
      },
      memberEventFormId: {
        key: 'memberEventFormId',
        label: 'Member Event Form ID',
        obfuscated: true,
        required: true,
        description: 'The form ID of the Healthie Member Event Form',
      },
}  satisfies Record<string, Setting>