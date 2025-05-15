import { sendSMS } from './sendSMS'
import { scheduleSMS } from './scheduleSMS'
import { sendEmail } from './sendEmail'
import { scheduleEmail } from './scheduleEmail'
import { sendEmailUsingTemplate } from './sendEmailUsingTemplate'
import { sendCampaign } from './sendCampaign'

export const actions = {
  sendSMS,
  scheduleSMS,
  sendEmail,
  scheduleEmail,
  sendEmailUsingTemplate,
  sendCampaign,
}
