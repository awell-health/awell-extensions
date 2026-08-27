import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const settings = {} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object(
  {} satisfies Record<keyof typeof settings, ZodType>,
)

export const validateSettings = (
  settings: unknown,
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}
