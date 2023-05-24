import { type Setting } from '../../lib/types'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    description: 'The API Key for the Metriport Medical API.',
    required: true,
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of the Metriport Medical API.',
    required: false,
  },
} satisfies Record<string, Setting>
