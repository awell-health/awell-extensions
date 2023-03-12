import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const Awell: Extension = {
  key: 'awell',
  category: 'integration',
  title: 'Awell API',
  description: 'Orchestrate care flows using the Awell Orchestration API',
  settings,
  actions,
  webhooks,
}
