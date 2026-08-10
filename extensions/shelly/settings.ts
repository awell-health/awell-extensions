import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import {
  DISCLAIMER_MSG,
  DISCLAIMER_MSG_FORM,
  WELLPATH_DISCLAIMER_MSG,
} from './lib/constants'
import {
  OptionalDisclaimerPlacementSchema,
  OptionalDisclaimerTextSchema,
} from './lib/disclaimer'

export const settings = {
  disclaimerText: {
    key: 'disclaimerText',
    label: 'Default disclaimer text',
    obfuscated: false,
    required: false,
    description: `Optional tenant-level default disclaimer for Shelly summaries. Action-level disclaimer text overrides this setting. If neither is configured, Shelly uses its existing defaults, such as "${DISCLAIMER_MSG}" for care-flow summaries and "${DISCLAIMER_MSG_FORM}" for form summaries. Example compliance text: "${WELLPATH_DISCLAIMER_MSG}"`,
  },
  disclaimerPlacement: {
    key: 'disclaimerPlacement',
    label: 'Default disclaimer placement',
    obfuscated: false,
    required: false,
    description:
      'Optional tenant-level default disclaimer placement for Shelly summaries. Enter "top" or "bottom". Action-level disclaimer placement overrides this setting. If neither is configured, Shelly uses "top".',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  disclaimerText: OptionalDisclaimerTextSchema,
  disclaimerPlacement: OptionalDisclaimerPlacementSchema,
} satisfies Record<keyof typeof settings, ZodTypeAny>)
