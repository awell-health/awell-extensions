import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  tenantId: {
    key: 'tenantId',
    label: 'Base URL',
    required: true,
    obfuscated: false,
    description:
      'The tenant ID associated to the organization you are connecting to.',
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    required: true,
    obfuscated: false,
    description: 'The client ID of the Cerner app used to authenticate.',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client Secret',
    required: true,
    obfuscated: true,
    description: 'The client secret of the Cerner app used to authenticate.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  tenantId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
