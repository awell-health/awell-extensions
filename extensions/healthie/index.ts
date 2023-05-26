import { actions } from './actions'
import { type Extension } from '@awell-health/awell-extensions-types'
import { settings } from './settings'
import { webhooks } from './webhooks'
import { AuthorType, Category } from '@awell-health/awell-extensions-types'

export const Healthie: Extension = {
  key: 'healthie',
  category: Category.EHR_INTEGRATIONS,
  title: 'Healthie',
  description:
    'Easily orchestrate actions in Healthie and receive webhooks events.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678908303/Awell%20Extensions/HealthieLogo.png',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
