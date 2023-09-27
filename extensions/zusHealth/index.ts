import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const ZusHealth: Extension = {
  key: 'zusHealth',
  title: 'Zus Health',
  icon_url:
    'https://zushealth.com/wp-content/themes/zus/assets/static/img/zus-logo.svg',
  description:
    'Simplify healthcare data interoperability with Zus, the shared health data platform, providing seamless access to patient data through APIs, embedded components, and EHR integrations',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.HTD,
  },
  actions: {},
  settings,
  webhooks,
}
