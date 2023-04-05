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
  testMode: {
    label: 'Test mode',
    key: 'testMode',
    obfuscated: false,
    required: false,
    description:
      'Set to "Yes" if you want to execute all API calls to DropboxSign in test mode. When test mode is enabled, signature requests will not be legally binding. When disabled, keep in mind that you must upgrade to a paid DropboxSign API plan to create signature requests via the extension.',
  },
} satisfies Record<string, Setting>
