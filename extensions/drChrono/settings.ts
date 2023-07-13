import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID for OAuth2 Password authentication.',
    required: true,
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 Password authentication.',
    required: true,
  },
} satisfies Record<string, Setting>
