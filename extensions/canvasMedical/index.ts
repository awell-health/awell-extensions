import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const CanvasMedical: Extension = {
  key: 'canvasMedical',
  title: 'Canvas Medical (BETA)',
  description:
    "Canvas Medical allows the collection and manage data through a digital device that contains all of the patient's medical history",
  icon_url:
    'https://assets-global.website-files.com/614e28d74fd62995e2f1948a/614e28d74fd6291bbef195a6_256.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
