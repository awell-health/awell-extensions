import { sendSMS } from './sendSMS'
import { scheduleSMS } from './scheduleSMS'
import { sendEmail } from './sendEmail'
import { scheduleEmail } from './scheduleEmail'
import { sendEmailUsingTemplate } from './sendEmailUsingTemplate'
import { sendEmailWithAttributes } from './sendEmailWithAttributes'

export const actions = {
  sendSMS,
  scheduleSMS,
  sendEmail,
  scheduleEmail,
  sendEmailUsingTemplate,
  sendEmailWithAttributes,
}
