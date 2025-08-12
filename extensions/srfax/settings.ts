import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  accountId: {
    key: 'accountId',
    label: 'Account ID',
    obfuscated: false,
    required: true,
  },
  password: {
    key: 'password',
    label: 'Password',
    obfuscated: true,
    required: true,
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    required: false,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accountId: z.string().min(1, {
    message: 'Missing "Account ID" in the extension settings.',
  }),
  password: z.string().min(1, {
    message: 'Missing "Password" in the extension settings.',
  }),
  baseUrl: z.string().url().optional().or(z.literal('')),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
