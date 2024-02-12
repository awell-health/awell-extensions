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
  faceSheetUrl: {
    key: 'faceSheetUrl',
    label: 'URL to facesheet (PDF)',
    obfuscated: true,
    required: false,
    description:
      'An optional URL for a face sheet document (in PDF format) which will be attached at the beginning of your actual message or document for faxes. This face sheet will only be included if it has been enabled at the action level.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  username: z.string().min(1, {
    message: 'Missing "Ursername in the extension settings."',
  }),
  password: z.string().min(1, {
    message: 'Missing "Password in the extension settings."',
  }),
  faceSheetUrl: z.string().url().optional().or(z.literal('')),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
