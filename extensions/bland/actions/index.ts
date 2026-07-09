import { sendCall } from './sendCall'
import { sendCallWithPathway } from './sendCallWithPathway'
import { sendSms } from './sendSms'
import { getCallDetails } from './getCallDetails'
import { stopActiveCall } from './stopActiveCall'

export const actions = {
  sendCallWithPathway,
  sendCall,
  sendSms,
  getCallDetails,
  stopActiveCall,
}
