import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const zoom: Extension = {
  key: 'zoom',
  title: 'Zoom',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1746027815/Awell%20Extensions/zoom.svg',
  description:
    'Zoom is a communications platform that allows users to connect with video, audio, phone, and chat.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
