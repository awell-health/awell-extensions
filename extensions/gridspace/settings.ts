import { z } from 'zod'
import type { Settings } from '@awell-health/extensions-core'

export const settings = {
  accountId: {
    label: 'Account ID',
    key: 'accountId',
    obfuscated: false,
    required: true,
    description: 'Your Gridspace account ID.',
  },
  clientSecret: {
    label: 'Client Secret',
    key: 'clientSecret',
    obfuscated: true,
    required: true,
    description: 'Your Gridspace client secret.',
  },
} satisfies Settings

export const SettingsSchema = z.object({
  accountId: z.string(),
  clientSecret: z.string(),
})

export type ExtensionSettings = z.infer<typeof SettingsSchema>
