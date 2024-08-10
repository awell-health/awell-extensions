import { type z } from 'zod'
import { SettingsValidationSchema } from '../../settings'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  salesforceSubdomain: 'awell',
  clientId: 'client_id',
  clientSecret: 'client_secret',
}
