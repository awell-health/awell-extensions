import { type Setting } from '../../lib/types'

export const settings = {
  apiKey: {
    label: 'API Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description:
      'Enter an API key so Awell can communicate with the Dropbox Sign API.',
  },
  clientId: {
    label: 'Client ID',
    key: 'clientId',
    obfuscated: false,
    required: false,
    description:
      'The client id of the API app created in Dropbox Sign. Only required if want to use embedded signature requests.',
  },
} satisfies Record<string, Setting>
