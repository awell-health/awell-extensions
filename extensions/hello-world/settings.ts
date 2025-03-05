import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  clear: {
    key: 'clear',
    label: 'Clear text',
    obfuscated: false,
    description:
      'A clear text value needed by the extension like an API endpoint.',
  },
  secret: {
    key: 'secret',
    label: 'Secret',
    obfuscated: true,
    description: 'A secret value needed by the extension like an API key.',
  },
} satisfies Record<string, Setting>
