import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import CalComApi from '../../calComApi'
import { SettingsSchema } from '../../schema'
import { type settings } from '../../settings'

export const createBooking: Action<typeof fields, typeof settings> = {
  key: 'createBooking',
  title: 'Create booking',
  description: 'Creates Booking',
  category: Category.SCHEDULING,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { apiKey },
        fields: { bookingId, title, description, status, start, end },
      } = validate({
        schema: z.object({
          settings: SettingsSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const calComApi = new CalComApi(apiKey)
      const booking = await calComApi.updateBooking(bookingId, {
        title,
        description,
        status,
        start,
        end,
      })

      await onComplete({
        data_points: {
          bookingId: String(booking.id),
          bookingUid: booking.uid,
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
        return
      }
      const errorMessage = (err as Error).message
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Get Booking failed: ${errorMessage}`,
            },
            error: {
              category: 'SERVER_ERROR',
              message: `Get Booking failed: ${errorMessage}`,
            },
          },
        ],
      })
    }
  },
}
