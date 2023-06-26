import { type Setting, passwordSettings } from '@awell-health/extensions-core'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Canvas Medical API.',
    required: true,
  },
  ...passwordSettings,
} satisfies Record<string, Setting>
