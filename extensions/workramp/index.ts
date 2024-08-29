import {
  type Extension,
  AuthorType,
  Category,
} from '@awell-health/extensions-core'
import { eventWebhook } from './webhooks'

export const Workramp: Extension = {
  key: 'workramp',
  title: 'Workramp',
  icon_url:
    'https://www.workramp.com/wp-content/themes/workramp/images/logo-workramp.svg',
  description:
    'An LMS platform. The system identifier used is https://www.workramp.com/',
  category: Category.SCHEDULING,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {},
  settings: {},
  webhooks: [eventWebhook],
}
