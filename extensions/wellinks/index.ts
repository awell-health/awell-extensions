import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './config/settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const Wellinks: Extension = {
  key: 'wellinks',
  category: Category.WORKFLOW,
  title: 'Wellinks',
  description: 'Wellinks Application Logic ',
  icon_url:
    'https://uploads-ssl.webflow.com/614a1ca9934d3f7e2d47575f/640a0a1f592f9d40f753dcba_rgb_wellinks_icon_full-color_light-bg.svg',
  author: {
    authorType: AuthorType.EXTERNAL,
    authorName: 'Wellinks',
  },
  settings,
  actions,
}
