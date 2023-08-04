import {
  type Setting,
  clientCredentialsSettings,
} from '@awell-health/extensions-core'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Canvas Medical API.',
    required: true,
  },
  ...clientCredentialsSettings,
} satisfies Record<string, Setting>
