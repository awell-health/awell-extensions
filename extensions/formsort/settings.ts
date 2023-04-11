import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'
import { isEmpty, isNil } from 'lodash'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    description: 'Your Formsort API key.',
    obfuscated: true,
    required: false,
  },
  environment: {
    key: 'environment',
    label: 'Environment',
    description:
      'Should be "staging" or "production". Defaults to "production".',
    obfuscated: false,
    required: false,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  /**
   * It's optional because not strictly required for the actions
   * we currently have today + Formsort's API is in alpha currently.
   */
  apiKey: z.optional(z.string()),
  environment: z
    .optional(z.enum(['production', 'staging']))
    .transform((env) => {
      if (isNil(env) || isEmpty(env)) return 'production'

      return env
    }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
