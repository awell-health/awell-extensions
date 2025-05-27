import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateSdk } from '../../../lib/api/validatePayloadAndCreateSdk'
import { isNil } from 'lodash'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const getBookingv2: Action<typeof fields, typeof settings> = {
  key: 'getBookingv2',
  title: 'Get booking (v2)',
  description: 'Retrieve booking details from Cal.com using the v2 api',
  category: Category.SCHEDULING,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { bookingUid },
      calv2Client,
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const response = await calv2Client.getBooking({
      bookingUid,
    })

    if (response.data.status === 'error') {
      await onError({
        events: [
          addActivityEventLog({
            message: !isNil(response.data.error)
              ? JSON.stringify(response.data.error)
              : 'Unknown error',
          }),
        ],
      })
      return
    }

    const bookingData = response.data.data

    await onComplete({
      data_points: {
        bookingData: JSON.stringify(bookingData),
        eventTypeId: String(bookingData.eventType.id),
        title: bookingData.title,
        description: bookingData.description,
        start: bookingData.start,
        end: bookingData.end,
        status: bookingData.status,
        cancelUrl: `https://app.cal.com/booking/${bookingData.uid}?cancel=true`,
        rescheduleUrl: `https://app.cal.com/reschedule/${bookingData.uid}`,
        firstAttendeeEmail: bookingData.attendees[0].email,
        firstAttendeeTimezone: bookingData.attendees[0].timeZone,
        firstAttendeeName: bookingData.attendees[0].name,
        location: bookingData.location,
        bookingFieldsResponses: isNil(bookingData?.bookingFieldsResponses)
          ? undefined
          : JSON.stringify(bookingData.bookingFieldsResponses),
        metadata: isNil(bookingData?.metadata)
          ? undefined
          : JSON.stringify(bookingData.metadata),
      },
    })
  },
}
