import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { sendSms } from './v1/actions'
import { settings } from './settings'

export const CmDotCom: Extension = {
  key: 'cmDotCom',
  title: 'cm.com',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1687860653/Awell%20Extensions/cm-f4ffa018.png',
  description: 'cm.com is a communications Platform for Messaging & Voice',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    sendSms,
  },
  settings,
}
