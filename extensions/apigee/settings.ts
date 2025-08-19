import { type Setting } from '@awell-health/extensions-core'
import { z } from 'zod'

export const settings = {
  gcpProjectId: {
    key: 'gcpProjectId',
    label: 'GCP Project ID',
    obfuscated: false,
    description: 'The Google Cloud Project ID where Apigee is enabled.',
  },
  apigeeOrgId: {
    key: 'apigeeOrgId',
    label: 'Apigee Organization ID',
    obfuscated: false,
    description: 'The Apigee organization ID to list API proxies from.',
  },
  credentialsStrategy: {
    key: 'credentialsStrategy',
    label: 'Credentials Strategy',
    obfuscated: false,
    description: 'Authentication strategy (ADC by default).',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  gcpProjectId: z.string().min(1),
  apigeeOrgId: z.string().min(1),
  credentialsStrategy: z.string().default('ADC'),
})
