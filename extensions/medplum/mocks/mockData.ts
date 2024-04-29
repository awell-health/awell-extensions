import { type z } from 'zod'
import { type SettingsValidationSchema } from '../settings'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  clientId: 'client_id',
  clientSecret: 'client_secret',
}
