import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { AuthorType, Category } from '../../lib/types/marketplace'
// import { webhooks } from './webhooks'

export const Metriport: Extension = {
  key: 'metriport',
  title: 'Metriport',
  description:
    'Metriport helps digital health companies access and manage health and medical data, through a single universal API.',

  // TODO: WE NEED JUST THE ICON NO NAME 60X60
  icon_url:
    'https://uploads-ssl.webflow.com/63e8455460afc21f779ddb79/63e845b3e00682d54cfd92fc_metriport-logo-p-500.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.EXTERNAL,
    authorName: 'Metriport',
  },
  settings,
  actions,
  // webhooks,
}
