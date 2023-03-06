import { type ExtensionSetting } from '../../lib/types'

export const settings = {
  secret: {
    key: 'secret',
    label: 'Secret',
    obfuscated: true,
    description: 'A secret value needed by the plugin like an API key.',
  },
} satisfies Record<string, ExtensionSetting>
