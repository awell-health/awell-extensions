import twilioSdk from '../twilioSdk'
import { FieldType, type Action, type Field } from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  message: {
    id: 'message',
    label: 'Message',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

export const patientSmsNotification: Action<typeof fields, typeof settings> = {
  key: 'patientSmsNotification',
  title: 'Send SMS to patient',
  category: 'Communication',
  description: 'Send an SMS message to the patient enrolled in this care flow.',
  fields,
  onActivityCreated: async (payload, onComplete) => {
    const {
      patient,
      fields: { message },
      settings,
    } = payload
    if (patient?.profile?.mobile_phone === undefined) {
      console.error('Recipient is not defined')
    } else {
      try {
        const client = twilioSdk(settings.accountSid, settings.authToken, {
          region: 'IE1',
          accountSid: settings.accountSid,
        })
        await client.messages.create({
          body: message,
          from: settings.fromNumber,
          to: patient.profile.mobile_phone,
        })
      } catch (err) {
        console.error('Error in twilio extension', err)
      }
    }
    await onComplete()
  },
}
