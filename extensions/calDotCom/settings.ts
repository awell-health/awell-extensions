import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  apiKey: {
    label: 'API Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description: 'Enter an API key so Awell can communicate with Cal.com.',
  },
} satisfies Record<string, Setting>
