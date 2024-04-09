import { type z } from 'zod'
import { type SettingsValidationSchema } from '../../settings'

export const mockSettings: z.infer<typeof SettingsValidationSchema> = {
  region: 'US',
  talkDeskAccountName: 'awell',
  clientId: 'client_id',
  clientSecret: 'client_secret',
}

export const mockFlowTriggeredResponse = {
  interaction_id: '4c47a224077e1ef73d320i3234b1c7dd',
  flow_version_id: '40773234b1c7dde1ef73d320i4c47a22',
}
