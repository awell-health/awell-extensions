import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {
  parseDateToUnixTimestamp,
  parseNumberToText,
  parseTextToNumber,
  parseUnixTimestampToDate,
  parseNumberToTextWithDictionary,
  generateDynamicUrl,
  parseStringToPhoneNumber,
  feetAndInchesToInches,
  serializeJson,
} from './v1/actions'
import { settings } from './settings'

export const Transform: Extension = {
  key: 'transform',
  title: 'Transform',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1696493305/Awell%20Extensions/imgbin-computer-icons-data-migration-extract-transform-load-others-z1r9GD10ftiy2XXyhy7kWi413.jpg',
  description:
    "Transform is an extension on Awell's Marketplace with utility functions that allows you to transform data from one type to another.",
  category: Category.DATA,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    feetAndInchesToInches,
    parseDateToUnixTimestamp,
    parseNumberToText,
    parseTextToNumber,
    parseUnixTimestampToDate,
    parseNumberToTextWithDictionary,
    generateDynamicUrl,
    parseStringToPhoneNumber,
    serializeJson,
  },
  settings,
}
