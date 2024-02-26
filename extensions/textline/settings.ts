import { z, type ZodTypeAny } from 'zod'

export const settings = {
  email: {
    label: 'Email',
    key: 'email',
    obfuscated: true,
    required: true,
    description: 'Your TextLine email',
  },
  password: {
    label: 'Password',
    key: 'password',
    obfuscated: true,
    required: true,
    description: 'Your TextLine password',
  },
  accessToken: {
    label: 'Access token',
    key: 'accessToken',
    obfuscated: true,
    required: true,
    description: 'Find your Access Token at TODO.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  password: z.string().min(1, { message: 'Missing TextLine password' }),
  email: z.string().min(1, { message: 'Missing TextLine email' }),
  accessToken: z.string().min(1, { message: 'Missing TextLine access token' }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
