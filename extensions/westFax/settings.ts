import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  username: {
    key: 'username',
    label: 'Username',
    obfuscated: false,
    required: true,
    description: 'Your WestFax username',
  },
  password: {
    key: 'password',
    label: 'Password',
    obfuscated: true,
    required: true,
    description: 'Your WestFax password',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  username: z.string().min(1, {
    message: 'Missing "Ursername in the extension settings."',
  }),
  password: z.string().min(1, {
    message: 'Missing "Password in the extension settings."',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
