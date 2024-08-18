import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import actions from './v1/actions'
import { settings } from './settings'

export const ExternalServer: Extension = {
  key: 'external-server',
  title: 'External Server',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1696493305/Awell%20Extensions/imgbin-computer-icons-data-migration-extract-transform-load-others-z1r9GD10ftiy2XXyhy7kWi413.jpg',
  description:
    'External server used for prototyping. See README for additional documentation.',
  category: Category.DATA,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
