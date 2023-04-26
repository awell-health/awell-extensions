import { type Setting } from '../../types'

const base = {
  auth_url: {
    key: 'auth_url',
    label: 'Authorization URL',
    obfuscated: false,
    description: 'The complete URL of OAuth2 authentication endpoint.',
    required: true,
  },
  client_id: {
    key: 'client_id',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID for OAuth2 authentication.',
    required: true,
  },
}

export const passwordSettings = {
  ...base,
  client_secret: {
    key: 'client_secret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 password authentication.',
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

export const clientCredentialsSettings = {
  ...base,
  client_secret: {
    key: 'client_secret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 client credentials authentication.',
    required: true,
  },
  audience: {
    key: 'audience',
    label: 'Audience',
    obfuscated: false,
    description: 'The audience for OAuth2 client credentials authentication.',
    required: false,
  },
} satisfies Record<string, Setting>
