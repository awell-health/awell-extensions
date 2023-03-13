import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const Healthie: Extension = {
  key: 'healthie',
  category: 'integration',
  title: 'Helthie',
  description: '',
  settings,
  actions,
  webhooks,
}
