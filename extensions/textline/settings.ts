import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  accessToken: {
    label: 'accessToken',
    key: 'accessToken',
    obfuscated: false,
    required: true,
    description: 'Your TextLine accessToken',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accessToken: z.string().min(1, { message: 'Missing TextLine password' }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
