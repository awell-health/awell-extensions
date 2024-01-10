import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Infobip: Extension = {
  key: 'infobip',
  title: 'Infobip',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1697459181/Awell%20Extensions/download_3.png',
  description:
    'Infobip is a global cloud communications platform that provides a wide range of communication and customer engagement solutions for businesses.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
