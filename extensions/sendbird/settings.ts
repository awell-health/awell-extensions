import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const settings = {
  applicationId: {
    label: 'Application ID',
    key: 'applicationId',
    obfuscated: true,
    required: true,
    description:
      'Visit https://dashboard.sendbird.com/ to retrieve Application ID for the app of your choosing',
  },
  chatApiToken: {
    label: 'Chat API token',
    key: 'chatApiToken',
    obfuscated: true,
    required: true,
    description:
      "Visit Application's settings and go to Settings > Application > General > API tokens to retrieve either Master API token or Secondary API token",
  },
  deskApiToken: {
    label: 'Desk API token',
    key: 'deskApiToken',
    obfuscated: true,
    required: true,
    description:
      "Visit Application's settings and go to Settings > Desk > Credentials to retrieve Desk API token",
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  applicationId: z.string().nonempty({
    error: 'Missing "Application ID in the extension settings."',
  }),
  chatApiToken: z.string().nonempty({
    error: 'Missing "Chat API token in the extension settings."',
  }),
  deskApiToken: z.string().nonempty({
    error: 'Missing "Desk API token in the extension settings."',
  }),
} satisfies Record<keyof typeof settings, ZodType>)
