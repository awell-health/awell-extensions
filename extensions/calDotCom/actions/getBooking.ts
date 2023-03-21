import { type DataPointDefinition, FieldType, type Action, type Field } from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import CalComApi from '../calComApi'
import { type settings } from '../settings'

const fields = {
  bookingId: {
    id: 'bookingId',
    label: 'Booking ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  calApptEventTypeId: {
    key: 'calApptEventTypeId',
    valueType: 'string',
  },
  calApptTitle: {
    key: 'calApptTitle',
    valueType: 'string',
  },
  calApptDescription: {
    key: 'calApptDescription',
    valueType: 'string',
  },
  calApptStartTime: {
    key: 'calApptStartTime',
    valueType: 'string',
  },
  calApptEndTime: {
    key: 'calApptEndTime',
    valueType: 'string',
  },
  calStatus: {
    key: 'calStatus',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getBooking: Action<typeof fields, typeof settings> = {
  key: 'getBooking',
  title: 'Get booking',
  description: 'Get Booking and save data in Data Points',
  category: Category.SCHEDULING,
  fields,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { bookingId },
      settings: { apiKey },
    } = payload
    if (apiKey === undefined || bookingId === undefined) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Missing apiKey or bookingId' },
          },
        ],
      })
    } else {
      try {
        const calComApi = new CalComApi(apiKey);
        const { booking } = await calComApi.getBooking(bookingId)

        await onComplete({
          data_points: {
            calApptEventTypeId: `${booking.eventTypeId}`,
            calApptTitle: booking.title,
            calApptDescription: booking.description,
            calApptStartTime: booking.startTime,
            calApptEndTime: booking.endTime,
            calStatus: booking.status,
          },
        })
      } catch (error) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `Error in calDotCom extension -> getBooking action: ${JSON.stringify(
                  error
                )}`,
              },
            },
          ],
        })
      }
    }
  },
}
