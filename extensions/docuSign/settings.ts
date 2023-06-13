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
  baseApiUrl: {
    label: 'Base API URL (DocuSign)',
    key: 'baseApiUrl',
    obfuscated: false,
    required: true,
    description:
      'Base API URL for API calls matching your environment on DocuSign. Defaults to: https://demo.docusign.net. Remember that this URL MUST match the one you registered for your app in DocuSign settings. Can be obtained from Account Base URI section of the Apps and Keys page or the "base_uri" property in the response of a call to the "/oauth/userinfo"',
  },
  baseAppUrl: {
    label: 'Base App URL',
    key: 'baseAppUrl',
    obfuscated: false,
    required: false,
    description:
      'Base App URL for your application. Set when you self host your application or use production environment. Defaults to: "https://goto.development.awell.health"',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  integrationKey: z.string(),
  accountId: z.string(),
  userId: z.string(),
  rsaKey: z.string(),
  baseApiUrl: z.string().url().default('https://demo.docusign.net'),
  baseAppUrl: z.string().url().default('https://goto.development.awell.health'),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
