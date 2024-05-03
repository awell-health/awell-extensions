import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  environment: {
    key: 'environment',
    label: 'Environment',
    obfuscated: false,
    required: false,
    description:
      'Dock Health supports two environments. Use the "DEVELOPMENT" environment to test your code and the "PRODUCTION" environment for your live application',
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    required: true,
    description:
      'Used to perform the Client Credential grant to obtain an access token',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description:
      'Used to perform the Client Credential grant to obtain an access token',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    required: true,
    description: 'The API key you received from Dock Health.',
  },
  organizationId: {
    key: 'organizationId',
    label: 'Organization ID',
    obfuscated: false,
    required: true,
    description: 'Identifier of the organization making the request.',
  },
  userId: {
    key: 'userId',
    label: 'User ID',
    obfuscated: false,
    required: true,
    description: 'Identifier of the user on whose behalf the request is made.',
  },
} satisfies Record<string, Setting>
