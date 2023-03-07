import { type Setting } from '../../lib/types'

export const settings = {
  secret: {
    key: 'secret',
    label: 'Secret',
    obfuscated: true,
    description: 'A secret value needed by the extension like an API key.',
  },
} satisfies Record<string, Setting>
