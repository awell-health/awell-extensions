import { type Setting } from '../../lib/types'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'Base URL of Elation API',
    required: true,
  },
  auth_url: {
    key: 'auth_url',
    label: 'Password',
    obfuscated: false,
    description: 'URL of Elation authentication endpoint',
    required: true,
  },
  client_id: {
    key: 'client_id',
    label: 'Client ID',
    obfuscated: false,
    description: 'Client ID for OAuth2 Password authentication',
    required: true,
  },
  client_secret: {
    key: 'client_secret',
    label: 'Client Secret',
    obfuscated: false,
    description: 'Client Secret for OAuth2 Password authentication',
    required: true,
  },
  username: {
    key: 'username',
    label: 'Username',
    obfuscated: false,
    description: 'API Username for OAuth2 Password authentication',
    required: true,
  },
  password: {
    key: 'password',
    label: 'Password',
    obfuscated: true,
    description: 'API Password for OAuth2 Password authentication',
    required: true,
  },
} satisfies Record<string, Setting>
