import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  auth_url: {
    key: 'auth_url',
    label: 'Auth server URL',
    obfuscated: false,
    required: true,
    description:
      'Used to perform the Client Credential grant to obtain an access token',
  },
  client_id: {
    key: 'client_id',
    label: 'Client ID',
    obfuscated: true,
    required: true,
    description:
      'Used to perform the Client Credential grant to obtain an access token',
  },
  client_secret: {
    key: 'client_secret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description:
      'Used to perform the Client Credential grant to obtain an access token',
  },
  api_url: {
    key: 'api_url',
    label: 'API URL',
    obfuscated: false,
    required: true,
    description: 'The base URL of the resource server/API',
  },
  scope: {
    key: 'scope',
    label: 'Scope',
    obfuscated: false,
    required: true,
    description:
      'The value is a space-delimited, case-sensitive string of requested scopes.',
  },
  practiceId: {
    key: 'practiceId',
    label: 'Practice ID',
    obfuscated: false,
    required: true,
    description: 'The ID of your practice within athenahealth',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  auth_url: z.string().url(),
  api_url: z.string().url(),
  scope: z.string().min(1),
  practiceId: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
