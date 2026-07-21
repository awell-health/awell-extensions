import { sendCall } from './sendCall'
import { sendCallWithPathway } from './sendCallWithPathway'
import { getCallDetails } from './getCallDetails'
import { stopActiveCall } from './stopActiveCall'
import { sendSms } from './sendSms'
import { createSmsConversation } from './createSmsConversation'

export const actions = {
  sendCallWithPathway,
  sendCall,
  getCallDetails,
  stopActiveCall,
  sendSms,
  createSmsConversation,
}
