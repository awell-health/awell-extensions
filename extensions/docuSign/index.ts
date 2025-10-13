import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {
  createEmbeddedSignatureRequestWithTemplate,
  embeddedSigning,
  createSequentialEmbeddedSignatureRequest,
} from './actions'
import { settings } from './settings'

export const DocuSign: Extension = {
  key: 'docuSign',
  title: 'DocuSign',
  icon_url: 'https://res.cloudinary.com/da7x4rzl4/image/upload/v1690539849/Awell%20Extensions/6345a42c2a73234ee04669dd_sig-icon.svg',
  description:
    'DocuSign makes your business faster, simpler and more cost-efficient with electronic agreements. Agree with confidence, with intuitive signing experiences across virtually any device.',
  category: Category.DOCUMENT_MANAGEMENT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    createEmbeddedSignatureRequestWithTemplate,
    embeddedSigning,
    createSequentialEmbeddedSignatureRequest,
  },
  settings,
}
