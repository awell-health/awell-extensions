import type { Setting } from '@awell-health/awell-extensions-types'
import { passwordSettings } from '../../lib/shared/settings/oauth'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Elation API.',
    required: true,
  },
  ...passwordSettings,
} satisfies Record<string, Setting>
