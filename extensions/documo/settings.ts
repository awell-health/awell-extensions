import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'Api Key',
    obfuscated: true,
    description: 'API Key',
  },
} satisfies Record<string, Setting>
