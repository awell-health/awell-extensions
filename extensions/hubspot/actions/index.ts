import { getcontact } from './getContact'
import { sendEmailWithSmtp } from './sendEmailWithSmtp'
import { sendEmailWithSingleSendApi } from './sendEmailWithSingleSendApi'
import { createOrUpdateContact } from './createOrUpdateContact'

const actions = {
  createOrUpdateContact,
  getcontact,
  sendEmailWithSmtp,
  sendEmailWithSingleSendApi,
}

export default actions
