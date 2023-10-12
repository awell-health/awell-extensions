import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  salesApiToken: {
    label: 'Sales API token',
    key: 'salesApiToken',
    obfuscated: true,
    required: true,
    description:
      'Visit Zendesk Sales CRM dashboard and go to Settings > Integration > OAuth to enable and create API token',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  salesApiToken: z.string().nonempty({
    message: 'Missing "Sales API token" in the extension settings.',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
