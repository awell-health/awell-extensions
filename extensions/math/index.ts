import { generateRandomNumber, calculateDateDifference } from './v1/actions'
import { type Extension } from '@awell-health/awell-extensions-types'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/awell-extensions-types'

export const MathExtension: Extension = {
  key: 'math',
  category: Category.MATH,
  title: 'Math',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1679592864/Awell%20Extensions/maths.png',
  description:
    'The Math extension provides some useful actions to perform simple mathematical operations.',
  settings,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    generateRandomNumber,
    calculateDateDifference,
  },
}
