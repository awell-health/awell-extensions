import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  accountId: {
    key: 'accountId',
    label: 'Account ID',
    obfuscated: false,
    description: 'The account ID of your Zoom account',
    required: true,
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID issued by the Server-to-Server OAuth app.',
    required: true,
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret issued by the Server-to-Server OAuth app.',
    required: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accountId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
