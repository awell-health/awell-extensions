import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { DEFAULT_API_VERSION } from './api/constants'

export const settings = {
  salesforceSubdomain: {
    key: 'salesforceSubdomain',
    label: 'Domain name',
    obfuscated: false,
    required: true,
    description:
      'The subdomain of your Salesforce tenant (e.g. "awell" or "awell.sandbox")',
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    required: true,
    description: '',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description: '',
  },
  username: {
    key: 'username',
    label: 'Username ',
    obfuscated: false,
    required: false,
    description:
      'The username of the user that the connected app is imitating. A username is only needed when using the Password grant, leave blank to use client credentials grant.',
  },
  password: {
    key: 'password',
    label: 'Password ',
    obfuscated: true,
    required: false,
    description:
      'The password of the user that the connected app is imitating. A password is only needed when using the Password grant, leave blank to use client credentials grant',
  },
  apiVersion: {
    key: 'apiVersion',
    label: 'API version ',
    obfuscated: false,
    required: false,
    description: `Defaults to ${DEFAULT_API_VERSION}`,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  salesforceSubdomain: z.string().min(1),
  clientId: z.string(),
  clientSecret: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  apiVersion: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
