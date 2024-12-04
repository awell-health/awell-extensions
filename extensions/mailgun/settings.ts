import { lowerCase } from 'lodash'
import { z, type ZodTypeAny } from 'zod'
import { type Setting } from '@awell-health/extensions-core'
import { getEmailValidation } from '../../src/lib/awell'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    required: true,
    description:
      'Your Mailgun API Key so the extension can authenticate with the Mailgun API.',
  },
  domain: {
    key: 'domain',
    label: 'Domain',
    obfuscated: false,
    required: true,
    description: 'The domain used to send the emails from.',
  },
  fromName: {
    key: 'fromName',
    label: 'From name',
    obfuscated: false,
    required: true,
    description: 'The name that will be used for the "From" header.',
  },
  fromEmail: {
    key: 'fromEmail',
    label: 'From email',
    obfuscated: false,
    required: true,
    description: 'The email address that will be used for the "From" header.',
  },
  region: {
    key: 'region',
    label: 'Region',
    obfuscated: false,
    required: false,
    description:
      'Sending domains can be provisioned in different regions. Pass "EU" for Europe or "US" for United States. Defaults to "US".',
  },
  testMode: {
    key: 'testMode',
    label: 'Test mode',
    obfuscated: false,
    required: false,
    description:
      'Set to "Yes" if you want to execute all API calls to Mailgun in test mode.',
  },
} satisfies Record<string, Setting>

export const RegionValidationSchema = z.optional(
  z.enum(['EU', 'eu', 'US', 'us'])
)

export const SettingsValidationSchema = z.object({
  apiKey: z.string(),
  domain: z.string(),
  fromName: z.string(),
  fromEmail: getEmailValidation(),
  region: RegionValidationSchema,
  testMode: z.optional(z.enum(['Yes', 'yes', 'No', 'no'])).transform((val) => {
    const serializedVal = lowerCase(val)

    if (serializedVal === 'yes') return true

    return false
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
