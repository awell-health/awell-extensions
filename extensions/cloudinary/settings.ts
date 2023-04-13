import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  cloudName: {
    key: 'cloudName',
    label: 'Cloud name',
    description:
      'Your Cloudinary product environment cloud name. This can be found in the Cloudinary console.',
    obfuscated: true,
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
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  cloudName: z.string(),
  uploadPreset: z.string(),
  folder: z.optional(z.string()),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
