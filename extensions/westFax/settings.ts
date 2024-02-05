import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  username: {
    key: 'username',
    label: 'Username',
    obfuscated: false,
    required: true,
    description: 'Your West Fax username',
  },
  password: {
    key: 'password',
    label: 'Password',
    obfuscated: true,
    required: true,
    description: 'Your West Fax password',
  },
} satisfies Record<string, Setting>

export const settingsValidationSchema = z.object({
  username: z.string().min(1, {
    message: 'Missing "API URL in the extension settings."',
  }),
  password: z.string().min(1, {
    message: 'Missing "API key in the extension settings."',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
