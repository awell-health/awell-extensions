import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { constructPrivateKey } from './lib/api/auth/constructPrivateKey'

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
  kid: {
    key: 'kid',
    label: 'KID',
    required: false,
    obfuscated: false,
    description: 'For apps using JSON Web Key Sets (including dynamically registed clients), set this value to the kid of the target public key from your key set',
  },
  jku: {
    key: 'jku',
    label: 'JKU',
    required: false,
    obfuscated: false,
    description: 'For apps using JSON Web Key Set URLs, optionally set this value to the URL you registered on your application',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  baseUrl: z.string().min(1),
  authUrl: z.string().min(1),
  clientId: z.string().min(1),
  /**
   * Private keys turn out to be sensitive to formatting (newlines, etc.)
   * But in Studio, a user can only enter the value of a setting in a single line.
   * So we need to transform the value to the correct format here.
   */
  privateKey: z.string().min(1).transform(constructPrivateKey),
  kid: z.string().optional(),
  jku: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
