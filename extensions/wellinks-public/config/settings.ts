import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
export const settings = {
  platformApiUrl: {
    key: 'platformApiUrl',
    label: 'Platform Api Url',
    obfuscated: false,
    required: false,
    description: 'The environment specific API URL for Platform',
  },
  platformApiKey: {
    key: 'platformApiKey',
    label: 'Platform Api Key',
    obfuscated: true,
    required: false,
    description: 'The environment specific API Key for Platform',
  },
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
  flourishApiUrl: {
    key: 'flourishApiUrl',
    label: 'Flourish API url',
    obfuscated: false,
    required: false,
    description: 'The environment specific Flourish API url.',
  },
  flourishApiKey: {
    key: 'flourishApiKey',
    label: 'Flourish API key',
    obfuscated: true,
    required: false,
    description: 'Your Flourish API key.',
  },
  flourishClientExtId: {
    key: 'flourishClientExtId',
    label: 'Flourish Client Ext ID',
    obfuscated: false,
    required: false,
    description: 'Your Flourish Client Ext ID.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  platformApiUrl: z.string().optional(),
  platformApiKey: z.string().optional(),
  apiUrl: z.string().optional(),
  apiKey: z.string().optional(),
  selectEventTypeQuestion: z.string().optional(),
  startSendingRemindersQuestions: z.string().optional(),
  memberEventFormId: z.string().optional(),
  flourishApiUrl: z.string().optional(),
  flourishApiKey: z.string().optional(),
  flourishClientExtId: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
