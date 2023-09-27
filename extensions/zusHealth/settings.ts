import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Zus Health API.',
    required: true,
  },
  auth_url: {
    key: 'auth_url',
    label: 'Auth URL',
    obfuscated: false,
    description: 'The base URL of authorization API',
    required: true,
  },
  client_id: {
    key: 'client_id',
    label: 'Client ID',
    obfuscated: false,
    description: '',
    required: true,
  },
  client_secret: {
    key: 'client_secret',
    label: 'Client Secret',
    obfuscated: false,
    description: '',
    required: true,
  },
  audience: {
    key: 'audience',
    label: 'Audience',
    obfuscated: false,
    description: '',
    required: true,
  },
} satisfies Record<string, Setting>
