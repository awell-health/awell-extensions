import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {
  createEmbeddedSignatureRequestWithTemplate,
  embeddedSigning,
} from './actions'
import { settings } from './settings'

export const DocuSign: Extension = {
  key: 'docuSign',
  title: 'DocuSign',
  icon_url: 'https://www.vectorlogo.zone/logos/docusign/docusign-ar21.svg',
  description:
    'DocuSign makes your business faster, simpler and more cost-efficient with electronic agreements. Agree with confidence, with intuitive signing experiences across virtually any device.',
  category: Category.DOCUMENT_MANAGEMENT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    createEmbeddedSignatureRequestWithTemplate,
    embeddedSigning,
  },
  settings,
}
