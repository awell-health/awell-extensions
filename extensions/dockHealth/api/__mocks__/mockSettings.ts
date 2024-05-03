import { type z } from 'zod'
import { type DockSettingsSchema } from '../../lib'

export const mockSettings: z.infer<typeof DockSettingsSchema> = {
  environment: 'DEVELOPMENT',
  clientId: 'client_id',
  clientSecret: 'client_secret',
  apiKey: 'apiKey',
  organizationId: 'organizationId',
  userId: 'userId',
}
