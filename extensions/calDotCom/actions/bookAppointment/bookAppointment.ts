import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { SettingsValidationSchema, type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const bookAppointment: Action<typeof fields, typeof settings> = {
  key: 'bookAppointment',
  title: 'Book appointment',
  description: 'Enable a stakeholder to book an appointment via Cal.com.',
  category: Category.SCHEDULING,
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const profile = (payload as any)?.patient?.profile as
        | {
            first_name?: string
            last_name?: string
            email?: string
            phone_number?: string
          }
        | undefined

      const first = profile?.first_name?.trim() || ''
      const last = profile?.last_name?.trim() || ''
      const name = [first, last].filter(Boolean).join(' ').trim()
      const email = profile?.email?.trim() || ''
      const phone = profile?.phone_number?.trim() || ''

      await onComplete({
        data_points: {
          defaultName: name,
          defaultEmail: email,
          defaultPhone: phone,
        },
      })
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
      }
    }
  },
}
