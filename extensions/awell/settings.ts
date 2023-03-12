import { type Setting } from '../../lib/types'

export const settings = {
  apiUrl: {
    key: 'apiUrl',
    label: 'API url',
    obfuscated: false,
    description: 'The environment specific API url.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    description: 'Your orchestration API key.',
  },
} satisfies Record<string, Setting>
