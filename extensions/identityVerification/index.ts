import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const identityVerification: Extension = {
  key: 'identityVerification',
  title: 'Identity Verification',
  description:
    "Verify the patient's identity by asking for a piece of personal information, such as their date of birth. ",
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1725995141/Awell%20Extensions/120965-200.png',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
