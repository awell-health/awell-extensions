import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'
import { isEmpty, isNil, lowerCase } from 'lodash'

export const settings = {
  apiKey: {
    label: 'API Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description:
      'Enter an API key so Awell can communicate with the Dropbox Sign API.',
  },
  clientId: {
    label: 'Client ID',
    key: 'clientId',
    obfuscated: false,
    required: true,
    description: 'The client ID of the app created in Dropbox Sign.',
  },
  testMode: {
    label: 'Test mode',
    key: 'testMode',
    obfuscated: false,
    required: false,
    description:
      'Set to "Yes" if you want to execute all API calls to DropboxSign in test mode. Set to "No" if you want to disable test mode. Keep in mind that when test mode is disabled, you must upgrade to a paid DropboxSign API plan to create signature requests. Defaults to "No".',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string(),
  clientId: z.string(),
  testMode: z
    .optional(z.enum(['Yes', 'No', 'yes', 'no']))
    .transform((testMode): boolean => {
      if (isEmpty(testMode) || isNil(testMode)) return false

      const serializedTestmode = lowerCase(testMode)

      if (serializedTestmode === 'yes') return true

      return false
    }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
