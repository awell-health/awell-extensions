import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    description: 'The API Key for the Metriport Medical API.',
    required: true,
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of the Metriport Medical API.',
    required: false,
  },
  webhookKey: {
    key: 'webhookKey',
    label: 'Webhook Key',
    obfuscated: true,
    description:
      'The Metriport webhook key used to verify incoming webhook requests (sent in the `x-webhook-key` header). Found in the Developers tab of the Metriport dashboard. When left empty, incoming webhook requests are not verified.',
    required: false,
  },
} satisfies Record<string, Setting>
