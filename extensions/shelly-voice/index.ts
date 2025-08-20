import { Category, AuthorType } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings, SettingsValidationSchema } from './settings'
import { webhooks } from './webhooks'

export const ShellyVoice = {
  key: 'shelly-voice',
  title: 'Shelly Voice',
  description: 'Configure and control LiveKit voice agents for Awell workflows.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
    author: 'Awell Health',
    email: 'support@awellhealth.com',
  },
  actions,
  webhooks,
  settings,
  settingsValidationSchema: SettingsValidationSchema,
}
