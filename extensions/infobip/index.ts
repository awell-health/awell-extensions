import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Infobip: Extension = {
  key: 'infobip',
  title: 'Infobip',
  // TODO: add url
  icon_url: '',
  description:
    'Infobip is a global cloud communications platform that provides a wide range of communication and customer engagement solutions for businesses.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
