import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const settings = {
  accessToken: {
    label: 'Access Token',
    key: 'accessToken',
    obfuscated: true,
    required: true,
    description:
      'Find your Access Token at https://application.textline.com/organization/api_settings.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accessToken: z.string().min(1, {
    error: 'Missing TextLine password',
  }),
} satisfies Record<keyof typeof settings, ZodType>)
