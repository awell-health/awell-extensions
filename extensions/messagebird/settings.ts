import { type Setting } from '@awell-health/awell-extensions-types'

export const settings = {
  apiKey: {
    label: 'API Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description: 'Your MessageBird API key.',
  },
  reportUrl: {
    label: 'Report URL',
    key: 'reportUrl',
    obfuscated: false,
    required: false,
    description:
      'The URL for delivery of status reports for messages. Must be HTTPS.',
  },
} satisfies Record<string, Setting>
