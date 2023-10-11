import { SettingsValidationSchema } from '../../../config/settings'
import { z } from 'zod'
const requiredFields = z.object({
  platformApiKey: z.string(),
  platformApiUrl: z.string(),
})

export const InsertMemberListEventSettingsSchema =
  SettingsValidationSchema.merge(requiredFields)
