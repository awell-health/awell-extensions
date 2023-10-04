import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: false,
    description: '####',
    required: true,
  },
} satisfies Record<string, Setting>
