import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Iterable: Extension = {
  key: 'iterable',
  title: 'Iterable',
  // TODO: needs icon url
  icon_url: '',
  description: 'Iterable is a marketing automation platform.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
