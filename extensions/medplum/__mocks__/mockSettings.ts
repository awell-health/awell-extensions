import { type z } from 'zod'
import { type SettingsValidationSchema } from '../settings'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  clientId: 'clientId',
  clientSecret: 'clientSecret',
}
