import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'
// import { webhooks } from './webhooks'

export const Metriport: Extension = {
  key: 'metriport',
  title: 'Metriport',
  description:
    'Metriport helps digital health companies access and manage health and medical data, through a single universal API.',
  icon_url:
    'https://lh3.googleusercontent.com/drive-viewer/AFGJ81rW-bH9cdgjRoPbEqBRgsscyVkBhTBeydPrsZn6hhWmPP5amMBHUXZmUaGG4XZR2e1EPgZMni1s9iqFpeaj1tKdqGwe8w=w3456-h1936',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.EXTERNAL,
    authorName: 'Metriport',
  },
  settings,
  actions,
  // webhooks,
}
