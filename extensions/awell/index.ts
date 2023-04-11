import { startCareFlow, updatePatient } from './v1/actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './v1/webhooks'
import { AuthorType, Category } from '../../lib/types/marketplace'

export const Awell: Extension = {
  key: 'awell',
  title: 'Awell Workflow',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  description: 'Orchestrate care flows using the Awell Orchestration API',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    startCareFlow,
    updatePatient,
    // deletePatient, Deleting the patient who is currently enrolled in the pathway seems dangerous
  },
  webhooks,
}
