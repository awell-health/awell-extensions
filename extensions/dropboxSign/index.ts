import { type Extension } from '@/types'
import { AuthorType, Category } from '@/types/marketplace'
import {
  sendSignatureRequestWithTemplate,
  sendRequestReminder,
  cancelSignatureRequest,
  getSignatureRequest,
  // createEmbeddedSignatureRequestWithTemplate
} from './v1/actions'
import { settings } from './settings'

export const DropboxSign: Extension = {
  key: 'dropboxSign',
  title: 'Dropbox Sign',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1680191271/Awell%20Extensions/dropboxsign.png',
  description:
    'Dropbox Sign (formerly HelloSign) is the easiest way to send, receive and manage legally binding electronic signatures.',
  category: Category.DOCUMENT_MANAGEMENT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    sendSignatureRequestWithTemplate,
    sendRequestReminder,
    cancelSignatureRequest,
    getSignatureRequest,
    /**
     * Not supported yet
     */
    // createEmbeddedSignatureRequestWithTemplate
  },
  settings,
}
