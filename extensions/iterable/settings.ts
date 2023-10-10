import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiKey: {
    label: 'Api Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description: 'Api Key used for request authorization',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().nonempty({
    message: 'Missing Api Key in the extension settings.',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
