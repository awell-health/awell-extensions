import { type Action, Category, validate } from '@awell-health/extensions-core'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import CalComApi from '../../../lib/api/v1/calComApi'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const getBooking: Action<typeof fields, typeof settings> = {
  key: 'getBooking',
  title: 'Get booking (v1)',
  description: 'Get Booking and save data in Data Points',
  category: Category.SCHEDULING,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    try {
      const {
        fields: { bookingId },
        settings: { apiKey },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })
      const calComApi = new CalComApi(apiKey)
      helpers.log({ meta, bookingId }, 'Getting Cal.com booking')
      const booking = await calComApi.getBooking(bookingId)

      await onComplete({
        data_points: {
          eventTypeId: `${booking.eventTypeId}`,
          title: booking.title,
          description: booking.description,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          cancelUrl: `https://app.cal.com/booking/${booking.uid}?cancel=true`,
          rescheduleUrl: `https://app.cal.com/reschedule/${booking.uid}`,
          videoCallUrl: booking.metadata.videoCallUrl ?? '',
          firstAttendeeEmail: booking.attendees[0].email,
          firstAttendeeTimezone: booking.attendees[0].timeZone,
          firstAttendeeName: booking.attendees[0].name,
          userEmail: booking.user.email,
          location: booking.responses?.location?.value,
        },
      })
    } catch (error) {
      helpers.log({ meta, error }, 'error', error as Error)
      if (error instanceof ZodError) {
        const err = fromZodError(error)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: err.message },
              error: {
                category: 'BAD_REQUEST',
                message: err.message,
              },
            },
          ],
        })
        return
      }
      const errorMessage = (error as Error).message
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
