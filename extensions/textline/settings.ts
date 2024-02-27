import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  email: {
    label: 'Email',
    key: 'email',
    obfuscated: false,
    required: true,
    description: 'Your TextLine agent email',
  },
  password: {
    label: 'Password',
    key: 'password',
    obfuscated: true,
    required: true,
    description: 'Your TextLine agent password',
  },
  apiKey: {
    label: 'Api Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description:
      'Find your Api Key at https://application.textline.com/organization/api_settings.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  password: z.string().min(1, { message: 'Missing TextLine password' }),
  email: z.string().min(1, { message: 'Missing TextLine email' }),
  apiKey: z.string().min(1, { message: 'Missing TextLine access token' }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
