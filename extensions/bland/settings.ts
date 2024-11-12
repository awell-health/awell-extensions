import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'Bland API key',
    obfuscated: true,
    description: '',
    required: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
