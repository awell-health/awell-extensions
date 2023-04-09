import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  openAiApiKey: {
    key: 'openAiApiKey',
    label: 'Open AI API Key',
    obfuscated: true,
    required: true,
    description: 'The OpenAI API uses API keys for authentication',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  openAiApiKey: z.string(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
