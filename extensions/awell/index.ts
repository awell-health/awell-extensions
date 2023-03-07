import { startCareFlow } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'

export const Awell: Extension = {
  key: 'awell',
  category: 'integration',
  title: 'Awell API',
  description: 'Orchestrate care flows using the Awell Orchestration API',
  settings,
  actions: {
    startCareFlow,
  },
}
