import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

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
    description: 'Your Healthie API key.',
  },
  formAnswerMaxSizeKB: {
    key: 'formAnswerMaxSizeKB',
    label: 'Form answer max size (KB)',
    obfuscated: false,
    required: false,
    description:
      'The maximum size of any form answer in KB. Form responses larger than that value (e.g. with images or PDFs) will be replaced by an Awell-generated message.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiUrl: z.string().nonempty({
    error: 'Missing "API URL in the extension settings."',
  }),
  apiKey: z.string().nonempty({
    error: 'Missing "API key in the extension settings."',
  }),
  formAnswerMaxSizeKB: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
} satisfies Record<keyof typeof settings, ZodType>)
