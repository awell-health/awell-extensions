import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { SettingsSchema } from '../../schema'
import { type settings } from '../../settings'
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
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validate({
        schema: z.object({
          settings: SettingsSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
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
