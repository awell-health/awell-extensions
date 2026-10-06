import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'Bland API key',
    obfuscated: true,
    description: '',
    required: true,
  },
  signingSecret: {
    key: 'signingSecret',
    label: 'Webhook signing secret',
    obfuscated: true,
    description:
      'The webhook signing secret from the Bland dev portal (Account Settings, Keys tab, "Replace Secret"). Bland signs each webhook with an HMAC-SHA256 of the body using it, sent in the `X-Webhook-Signature` header. When set, webhooks that are not signed with it are rejected. When left empty, incoming webhooks are not verified.',
    required: false,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1),
  signingSecret: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodType>)
