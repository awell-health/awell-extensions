import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { completeFlow } from './v1/actions'
import { settings } from './settings'

export const Formsort: Extension = {
  key: 'formsort',
  title: 'Formsort',
  icon_url:
    'https://images.saasworthy.com/formsort_30763_logo_1658487172_csumf.jpg',
  description: 'Formsort is a fully-managed form-building platform.',
  category: Category.FORMS,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    completeFlow,
  },
  settings,
}
