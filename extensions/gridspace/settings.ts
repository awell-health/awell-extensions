import z from 'zod'
import type { Settings } from '@awell-health/extensions-core'
export const settings = {
  basicAuthorization: {
    label: 'Basic Authorization',
    key: 'basicAuthorization',
    obfuscated: true,
    required: true,
    description: 'The basic authorization token for Gridspace.',
  },
} satisfies Settings

export const SettingsSchema = z.object({
  basicAuthorization: z.string(),
})
export type ExtensionSettings = z.infer<typeof SettingsSchema>
