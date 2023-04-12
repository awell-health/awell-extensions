import { type Setting } from '../../lib/types'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Elation API.',
    required: true,
  },
  auth_url: {
    key: 'auth_url',
    label: 'Authorization URL',
    obfuscated: false,
    description: 'The complete URL of Elation authentication endpoint.',
    required: true,
  },
  client_id: {
    key: 'client_id',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID for OAuth2 Password authentication.',
    required: true,
  },
  client_secret: {
    key: 'client_secret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 Password authentication.',
    required: true,
  },
  username: {
    key: 'username',
    label: 'Username',
    obfuscated: false,
    description: 'The API username for OAuth2 password authentication.',
    required: true,
  },
  password: {
    key: 'password',
    label: 'Password',
    obfuscated: true,
    description: 'The API password for OAuth2 password authentication.',
    required: true,
  },
} satisfies Record<string, Setting>
