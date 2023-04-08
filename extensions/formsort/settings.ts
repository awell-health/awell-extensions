import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    required: false,
    description: 'Your Formsort API key.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  /**
   * It's optional because not strictly required for the actions
   * we currently have today + Formsort's API is in alpha currently.
   */
  apiKey: z.optional(z.string()),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
