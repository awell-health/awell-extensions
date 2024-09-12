import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  openAiOrgId: {
    key: 'openAiOrgId',
    label: 'OpenAI organisaiton ID ',
    obfuscated: false,
    required: true,
    description: '',
  },
  openAiProjectId: {
    key: 'openAiProjectId',
    label: 'OpenAI project ID ',
    obfuscated: false,
    required: true,
    description: '',
  },
  openAiApiKey: {
    key: 'openAiApiKey',
    label: 'OpenAI API key ',
    obfuscated: true,
    required: true,
    description: '',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  openAiOrgId: z.string().min(1),
  openAiProjectId: z.string().min(1),
  openAiApiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
