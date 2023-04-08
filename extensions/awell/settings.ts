import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiUrl: {
    key: 'apiUrl',
    label: 'API url',
    obfuscated: false,
    required: true,
    description: 'The environment specific API url.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    required: true,
    description: 'Your orchestration API key.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiUrl: z.string(),
  apiKey: z.string(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
