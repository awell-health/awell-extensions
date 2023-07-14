import { z, type ZodTypeAny } from 'zod'
import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of TalkDesk API.',
    required: true,
  },
  authUrl: {
    key: 'authUrl',
    label: 'Authorization URL',
    obfuscated: false,
    description: 'The complete URL of TalkDesk authentication endpoint.',
    required: true,
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID for OAuth2 Password authentication.',
    required: true,
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 Password authentication.',
    required: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  baseUrl: z.string().nonempty(),
  authUrl: z.string().nonempty(),
  clientId: z.string().nonempty(),
  clientSecret: z.string().nonempty(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
