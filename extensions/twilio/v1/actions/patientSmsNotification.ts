import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import twilioSdk from '../../common/sdk/twilio'
import { FieldType, type Action, type Field } from '../../../../lib/types'
import { SettingsValidationSchema, type settings } from '../../settings'
import { Category } from '../../../../lib/types/marketplace'
import {
  MessageValidationSchema,
  PhoneValidationSchema,
} from '../../common/validation'
import { validate } from '../../../../lib/shared/validation'

const fields = {
  message: {
    id: 'message',
    label: 'Message',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

const PatientProfile = z.object({
  mobile_phone: PhoneValidationSchema,
})

const PatientValidationSchema = z.object({ profile: PatientProfile })

const Schema = z.object({
  patient: PatientValidationSchema,
  fields: z.object({ message: MessageValidationSchema }),
  settings: SettingsValidationSchema,
})

export const patientSmsNotification: Action<typeof fields, typeof settings> = {
  key: 'patientSmsNotification',
  title: 'Send SMS to patient',
  category: Category.COMMUNICATION,
  description: 'Send an SMS message to the patient enrolled in this care flow.',
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        patient: {
          profile: { mobile_phone },
        },
        fields: { message },
        settings: { accountSid, authToken, fromNumber },
      } = validate({ schema: Schema, payload })

      const client = twilioSdk(accountSid, authToken, {
        region: 'IE1',
        accountSid,
      })

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: mobile_phone,
      })

      await onComplete()
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'BAD_REQUEST',
                message: error.message,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
