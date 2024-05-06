import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  testModeSecretKey: {
    key: 'testModeSecretKey',
    label: 'Stripe secret key (test mode)',
    obfuscated: true,
    required: true,
    description:
      'Use this key to authenticate requests on your server when in test mode',
  },
  liveModeSecretKey: {
    key: 'liveModeSecretKey',
    label: 'Stripe secret key (live mode)',
    obfuscated: true,
    required: false,
    description:
      'Use this key to authenticate requests on your server when in live mode',
  },
  mode: {
    key: 'mode',
    label: 'Mode',
    obfuscated: true,
    required: false,
    description:
      '"Test" or "Live", defaults to "Test". Make sure to have a secret key set for live mode when enabling it.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  liveModeSecretKey: z.string().optional(),
  testModeSecretKey: z.string().min(1),
  mode: z
    .string()
    .toUpperCase()
    .optional()
    .pipe(z.enum(['LIVE', 'TEST'])),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
