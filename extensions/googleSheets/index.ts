import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {} from './actions'
import { settings } from './settings'

export const GoogleSheets: Extension = {
  key: 'calDotCom',
  title: 'Cal.com',
  icon_url: 'https://cal.com/logo.svg',
  description: 'Enable scheduling in your care flows with Cal.com.',
  category: Category.DATA,
  author: {
    authorType: AuthorType.HTD,
  },
  actions: {},
  settings,
}
