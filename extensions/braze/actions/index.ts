import { sendSMS } from './sendSMS'
import { scheduleSMS } from './scheduleSMS'
import { sendEmail } from './sendEmail'
import { scheduleEmail } from './scheduleEmail'
import { sendEmailUsingTemplate } from './sendEmailUsingTemplate'

const actions = {
  sendSMS,
  scheduleSMS,
  sendEmail,
  scheduleEmail,
  sendEmailUsingTemplate,
}

export default actions
