import {
  type Field,
  FieldType,
  type Action,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
// import { client } from '@sendgrid/client'
import { WellinksSendgridClient } from '../../wellinksSendgridClient'
import { type settings } from '../../settings'
import { isEmpty, isNil } from 'lodash'

const fields = {
  email: {
    id: 'email',
    label: 'Patient Email',
    description: 'The email of the patient to unenroll from Sendgrid',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>


export const unenrollFromSendgrid: Action<
  typeof fields,
  typeof settings
> = {
  key: 'checkForScheduledAppointment',
  category: Category.SCHEDULING,
  title: 'Check for a Scheduled Appointment',
  description:
    'Check that a patient has an appointment of a certain type scheduled in the future',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { email } = fields
    
    const sendgridClient = new WellinksSendgridClient(settings.sendgridApiKey ?? '')

    try {
      if (!isNil(email) && !isEmpty(email)) {
        await sendgridClient.groups.addSuppression('21827', email)
        await sendgridClient.groups.addSuppression('21848', email)
        await onComplete()
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'There was in error attempting to unenroll user from Sendgrid' },
              error: {
                category: 'SERVER_ERROR',
                message: 'Email cannot be blank',
              },
            },
          ],
        })
      }
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'There was in error processing the Charting Items' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
