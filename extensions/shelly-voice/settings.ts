import { z } from 'zod'
import { Setting } from '@awell-health/extensions-core'

export const settings: Record<string, Setting> = {
  livekitServerUrl: {
    key: 'livekitServerUrl',
    label: 'LiveKit Server URL',
    obfuscated: false,
    required: true,
  },
  livekitApiKey: {
    key: 'livekitApiKey',
    label: 'LiveKit API Key',
    obfuscated: true,
    required: true,
  },
  livekitApiSecret: {
    key: 'livekitApiSecret',
    label: 'LiveKit API Secret',
    obfuscated: true,
    required: true,
  },
  defaultVoice: {
    key: 'defaultVoice',
    label: 'Default Voice',
    obfuscated: false,
    required: false,
  },
  defaultLanguage: {
    key: 'defaultLanguage',
    label: 'Default Language',
    obfuscated: false,
    required: false,
  },
}

export const SettingsValidationSchema = z.object({
  livekitServerUrl: z.string().url(),
  livekitApiKey: z.string().min(1),
  livekitApiSecret: z.string().min(1),
  defaultVoice: z.string().optional(),
  defaultLanguage: z.string().optional(),
})
