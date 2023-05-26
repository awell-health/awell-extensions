import { type Extension } from '@awell-health/awell-extensions-types'
import { AuthorType, Category } from '@awell-health/awell-extensions-types'
import { uploadFiles } from './actions'
import { settings } from './settings'

export const Cloudinary: Extension = {
  key: 'cloudinary',
  title: 'Cloudinary',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1684740031/Awell%20Extensions/cloudinary_web_favicon.png',
  description:
    'Cloudinary is a cloud-based image and video management platform for storing, managing, and delivering digital media assets.',
  category: Category.CONTENT_AND_FILES,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    uploadFiles,
  },
  settings,
}
