import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const Healthie: Extension = {
  key: 'healthie',
  category: 'integration',
  title: 'Helthie',
  description: '',
  icon_url:
    'https://assets-global.website-files.com/5ff335a72af33d6ff0d8191f/6001d714ffd4c31ae0361055_healthie-logo-color.svg',
  settings,
  actions,
  webhooks,
}
