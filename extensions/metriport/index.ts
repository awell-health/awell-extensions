import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { webhooks } from './webhooks'
import { ingestion } from './ingestion'
import { METRIPORT_IDENTIFIER_SYSTEM } from './shared/identifierSystem'

export const Metriport: Extension = {
  key: 'metriport',
  title: 'Metriport',
  description:
    'Metriport helps digital health companies access and manage health and medical data, through a single universal API.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1689856160/Awell%20Extensions/metriport.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.EXTERNAL,
    authorName: 'Metriport',
  },
  settings,
  actions,
  webhooks,
  identifier: { system: METRIPORT_IDENTIFIER_SYSTEM },
  ingestion,
}
