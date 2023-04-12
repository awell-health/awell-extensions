import { type Setting } from '../../lib/types'

export const settings = {
  apiUrl: {
    key: 'apiUrl',
    label: 'API url',
    obfuscated: false,
    required: true,
    description: 'The environment specific API url.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    required: true,
    description: 'Your Awell (Orchestration) API key.',
  },
} satisfies Record<string, Setting>
