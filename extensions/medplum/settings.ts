import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Medplum',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Medplum',
  },
  awellApiUrl: {
    key: 'awellApiUrl',
    label: 'Awell API URL',
    obfuscated: true,
    required: false,
    description: 'Temporary to support "Submit Questionnaire Response" action',
  },
  awellApiKey: {
    key: 'awellApiKey',
    label: 'Awell API key',
    obfuscated: true,
    required: false,
    description: 'Temporary to support "Submit Questionnaire Response" action',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  awellApiKey: z.string().optional(),
  awellApiUrl: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
