import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    required: true,
    obfuscated: false,
    description:
      'The base URL for the Epic API, e.g. https://fhir.epic.com/interconnect-fhir-oauth/api',
  },
  authUrl: {
    key: 'authUrl',
    label: 'Auth URL',
    required: true,
    obfuscated: false,
    description:
      'The auth URL for the Epic API, e.g. https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    required: true,
    obfuscated: false,
    description: 'The client ID of the Epic app used to authenticate.',
  },
  privateKey: {
    key: 'privateKey',
    label: 'Private Key',
    required: true,
    obfuscated: true,
    description: 'The private key of the Epic app used to authenticate.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  baseUrl: z.string().min(1),
  authUrl: z.string().min(1),
  clientId: z.string().min(1),
  privateKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
