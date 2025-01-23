import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  openAiApiKey: {
    key: 'openAiApiKey',
    label: 'OpenAI API key ',
    obfuscated: true,
    required: false,
    description: 'If not provided, the default Awell OpenAI API key will be used.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  openAiApiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
