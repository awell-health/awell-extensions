import { type Setting } from '../../lib/types'
import { clientCredentialsSettings } from '../../lib/shared/settings/oauth'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Elation API.',
    required: true,
  },
  ...clientCredentialsSettings,
} satisfies Record<string, Setting>
