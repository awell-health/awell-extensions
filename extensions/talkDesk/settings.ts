import { z, type ZodTypeAny } from 'zod'
import { type Setting } from '@awell-health/extensions-core'
import { APIRegionSchema } from './api/apiConfig'

export const settings = {
  talkDeskAccountName: {
    key: 'talkDeskAccountName',
    label: 'Talkdesk account name',
    obfuscated: false,
    description: '',
    required: true,
  },
  region: {
    key: 'region',
    label: 'Region',
    obfuscated: false,
    description: 'US, EU, or Canada. Defaults to US.',
    required: false,
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID for OAuth2 Password authentication.',
    required: true,
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 Password authentication.',
    required: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  talkDeskAccountName: z.string().nonempty(),
  region: APIRegionSchema.default('US'),
  clientId: z.string().nonempty(),
  clientSecret: z.string().nonempty(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
