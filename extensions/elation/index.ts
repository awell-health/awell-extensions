import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category, FieldType } from '@awell-health/extensions-core'
import { webhooks } from './webhooks'
import { timers } from './timers'
import { makeAPIClient } from './client'
import { subscription } from './subscription'

export const Elation: Extension = {
  key: 'elation',
  title: 'Elation',
  description:
    "Elation is a clinical-first EHR and patient engagement tool. It's designed for the craft of primary care medicine.",
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1680683235/Awell%20Extensions/elation_favicon.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
  identifier: {
    system: 'https://www.elationhealth.com/',
  },
  timers,
  subscription,
}
