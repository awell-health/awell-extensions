import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const airtop: Extension = {
  key: 'airtop',
  title: 'Airtop',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1754294899/Awell%20Extensions/1797e9c62ed74a4d95e8b9955abb6259.png',
  description:
    'Effortlessly scrape and control any site with inexpensive and scalable AI-powered cloud browsers',
  category: Category.DATA,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
