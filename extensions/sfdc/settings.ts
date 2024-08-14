import { type Setting } from '@awell-health/extensions-core'
import { z, ZodTypeAny } from 'zod'
import { DEFAULT_API_VERSION } from './api/constants'

export const settings = {
  salesforceSubdomain: {
    key: 'salesforceSubdomain',
    label: 'Domain name',
    obfuscated: false,
    required: true,
    description:
      'The subdomain of your Salesforce org (e.g. "awell" or "awell.sandbox")',
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    required: false,
    description:
      'Client ID issued when you create the API integration in Installed Packages.',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: false,
    description:
      'Client secret issued when you create the API integration in Installed Packages.',
  },
  accessToken: {
    key: 'accessToken',
    label: 'Access toke ',
    obfuscated: false,
    required: false,
    description:
      'When an access token is provided, the extension will not obtain an access token via the client credenials grant but instead just append the given access token to the request.',
  },
  apiVersion: {
    key: 'apiVersion',
    label: 'API version ',
    obfuscated: false,
    required: false,
    description: 'Defaults v61.0',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  salesforceSubdomain: z.string().min(1),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  accessToken: z.string().optional(),
  apiVersion: z.string().default(DEFAULT_API_VERSION),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
