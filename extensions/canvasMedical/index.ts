import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'
import schemas from './schemas'

export const CanvasMedical: Extension<typeof schemas> = {
  key: 'canvasMedical',
  title: 'Canvas Medical (BETA)',
  description:
    'Canvas Medical is an EHR that is FHIR compliant. NOT FOR PRODUCTION USE',
  icon_url:
    'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fcanvas-medical&psig=AOvVaw1W3HJMtA6XTVrAPzcCHYIl&ust=1690588613304000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCMimzcGLsIADFQAAAAAdAAAAABAQ',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  schemas,
}
