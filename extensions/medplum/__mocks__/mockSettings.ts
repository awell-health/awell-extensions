import { type z } from 'zod'
import { type SettingsValidationSchema } from '../settings'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  clientId: 'd8ab9ce8-7c71-41fe-8996-b19dceca2daa',
  clientSecret:
    '8ae7b6f85d913d35f0ad80e2e7e9b5560dad1fdcead5b00ab660dd6bc9be6017412540042e00f32f2ddcac554b70f5f2',
}
