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
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1724917358/Awell%20Extensions/workramp_logo.jpg',
  description:
    'An LMS platform. The system identifier used is https://www.workramp.com/',
  category: Category.CONTENT_AND_FILES,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {},
  settings: {},
  webhooks: [eventWebhook],
}
