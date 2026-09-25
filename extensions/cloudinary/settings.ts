import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const settings = {
  cloudName: {
    key: 'cloudName',
    label: 'Cloud name',
    description:
      'Your Cloudinary product environment cloud name. This can be found in the Cloudinary console.',
    obfuscated: false,
    required: true,
  },
  uploadPreset: {
    key: 'uploadPreset',
    label: 'Upload preset',
    description:
      'The name of an upload preset defined for your product environment. You can always overwrite the preset on the action level.',
    obfuscated: false,
    required: true,
  },
  folder: {
    key: 'folder',
    label: 'Folder',
    description:
      'Upload files to the specified folder. You can always overwrite the folder on the action level.',
    obfuscated: false,
    required: false,
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    description:
      'Your Cloudinary API key. Only required for server-side actions ("Upload file from data point", "Delete file"). Found under Settings > Access keys in the Cloudinary console.',
    obfuscated: false,
    required: false,
  },
  apiSecret: {
    key: 'apiSecret',
    label: 'API secret',
    description:
      'Your Cloudinary API secret. Only required for server-side actions ("Upload file from data point", "Delete file").',
    obfuscated: true,
    required: false,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  cloudName: z.string(),
  uploadPreset: z.string(),
  folder: z.optional(z.string()),
  apiKey: z.optional(z.string()),
  apiSecret: z.optional(z.string()),
} satisfies Record<keyof typeof settings, ZodType>)

/**
 * Server-side actions need API credentials. The extension-level settings keep
 * them optional so existing tenants (who only use the hosted-pages upload
 * widget) are unaffected; the actions that need them enforce presence here.
 */
const API_KEY_MISSING =
  'The Cloudinary "API key" setting is required for this action. Add it in the extension settings.'
const API_SECRET_MISSING =
  'The Cloudinary "API secret" setting is required for this action. Add it in the extension settings.'

export const ServerSideSettingsValidationSchema = SettingsValidationSchema.extend(
  {
    apiKey: z.string({ error: API_KEY_MISSING }).min(1, { error: API_KEY_MISSING }),
    apiSecret: z
      .string({ error: API_SECRET_MISSING })
      .min(1, { error: API_SECRET_MISSING }),
  },
)
