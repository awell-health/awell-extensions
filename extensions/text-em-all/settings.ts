import { z } from 'zod'
import type { Settings } from '@awell-health/extensions-core'

export const settings = {
  customerKey: {
    label: 'Customer Key',
    key: 'customerKey',
    obfuscated: true,
    required: true,
    description: 'Your Text-Em-All customer key.',
  },
  customerSecret: {
    label: 'Customer Secret',
    key: 'customerSecret',
    obfuscated: true,
    required: true,
    description: 'Your Text-Em-All customer secret.',
  },
  token: {
    label: 'Token',
    key: 'token',
    obfuscated: true,
    required: true,
    description: 'Your Text-Em-All token.',
  },
} satisfies Settings

export const SettingsSchema = z.object({
  customerKey: z.string(),
  customerSecret: z.string(),
  token: z.string(),
})

export type ExtensionSettings = z.infer<typeof SettingsSchema>
