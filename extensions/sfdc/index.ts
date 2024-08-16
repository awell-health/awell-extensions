import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const sfdc: Extension = {
  key: 'sfdc',
  title: 'Salesforce',
  description:
    'Salesforce.com is a cloud-based customer relationship management (CRM) software used to manage customer data, sales processes, marketing campaigns, and customer service activities',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1723280338/Awell%20Extensions/logo-sfdc-netherlands-b-v-salesforce-com.jpg',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
