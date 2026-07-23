import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, fields } from './config'
import CalComApi from '../../lib/api/v1/calComApi'
import { SettingsValidationSchema, type settings } from '../../settings'

export const deleteBooking: Action<typeof fields, typeof settings> = {
  key: 'deleteBooking',
  title: 'Delete booking (v1)',
  description: 'Deletes Booking in Cal.com',
  category: Category.SCHEDULING,
  fields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    try {
      const {
        settings: { apiKey },
        fields: { bookingId, allRemainingBookings, reason },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const calComApi = new CalComApi(apiKey)
      const deleteBookingRequest = {
        allRemainingBookings,
        cancellationReason: reason,
      }

      helpers.log(
        { meta, bookingId, deleteBookingRequest },
        'Deleting Cal.com booking',
      )

      await calComApi.deleteBooking(bookingId, deleteBookingRequest)

      await onComplete()
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
