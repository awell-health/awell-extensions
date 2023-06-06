import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  integrationKey: {
    label: 'Integration key (client ID)',
    key: 'integrationKey',
    obfuscated: true,
    required: true,
    description:
      'An integration key identifies your integration and links to its configuration values. This can be obtained in your developer account from the Apps and Keys page',
  },
  accountId: {
    label: 'API Account ID',
    key: 'accountId',
    obfuscated: false,
    required: true,
    description:
      'A GUID value that identifies your account. This can be obtained in your developer account from the Apps and Keys page',
  },
  userId: {
    label: 'Impersonated User ID (UserID)',
    key: 'userId',
    obfuscated: false,
    required: true,
    description:
      'This is a GUID identifying the DocuSign user that you will be impersonating with the access token. Your own User ID can be found at the top of the Apps and Keys page.',
  },
  rsaKey: {
    label: 'RSA private key (in Base64 format)',
    key: 'rsaKey',
    obfuscated: true,
    required: true,
    description:
      "This is for the integration key you obtained above and can also be created on the Apps and Keys page. You only need the private key, and it can only be copied once. Make sure to retain it for your records. Provide it in Base64 format - if you copy the key as is, it will not be valid as newlines and formatting won't be persisted.",
  },
  baseUrl: {
    label: 'Base URL',
    key: 'baseUrl',
    obfuscated: false,
    required: true,
    description:
      'Base URL for API calls matching your environment. Can be obtained from Account Base URI section of the Apps and Keys page or the "base_uri" property in the response of a call to the "/oauth/userinfo"',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  integrationKey: z.string(),
  accountId: z.string(),
  userId: z.string(),
  rsaKey: z.string(),
  baseUrl: z.string().url(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
