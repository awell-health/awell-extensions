import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object(
  {} satisfies Record<keyof typeof settings, ZodTypeAny>
)
