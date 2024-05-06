import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  testModeSecretKey: {
    key: 'testModeSecretKey',
    label: 'Test mode secret key',
    obfuscated: true,
    required: true,
    description:
      'This key is used to authenticate requests on your server when in test mode',
  },
  testModePublishableKey: {
    key: 'testModePublishableKey',
    label: 'Test mode publishable key',
    obfuscated: false,
    required: true,
    description:
      'This key is used for testing Embedded checkout in Awell Hosted Pages',
  },
  liveModeSecretKey: {
    key: 'liveModeSecretKey',
    label: 'Live mode secret key',
    obfuscated: true,
    required: false,
    description:
      'This key is used to authenticate requests on your server when in live mode',
  },
  liveModePublishableKey: {
    key: 'liveModePublishableKey',
    label: 'Live mode publishable key',
    obfuscated: false,
    required: false,
    description:
      'This key is used for testing Embedded checkout in Awell Hosted Pages',
  },
  mode: {
    key: 'mode',
    label: 'Mode',
    obfuscated: true,
    required: false,
    description:
      '"Test" or "Live", defaults to "Test". Make sure to have a secret key set for live mode when enabling it.',
  },
  hostedPagesEnvironmentVariable: {
    key: 'hostedPagesEnvironmentVariable',
    label: 'Hosted Pages environment variable',
    obfuscated: true,
    required: false,
    description:
      'This will be removed once the extension is out of alpha mode. This needs to be configured by an Awell developer.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  liveModeSecretKey: z.string().optional(),
  liveModePublishableKey: z.string().optional(),
  testModeSecretKey: z.string().min(1),
  testModePublishableKey: z.string().min(1),
  hostedPagesEnvironmentVariable: z.string().min(1),
  mode: z
    .string()
    .toUpperCase()
    .optional()
    .pipe(z.enum(['LIVE', 'TEST'])),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
