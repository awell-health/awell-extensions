import { TestHelpers } from '@awell-health/extensions-core'
import { CalV2ApiClient } from '../../../lib/api/v2/client'
import { getBookingv2 as action } from './getBooking'
import { createAxiosError } from '../../../../../tests'
import { AxiosError, AxiosResponse } from 'axios'
import { getBookingMockResponse } from './__testdata__/GetBookingMockResponse'
import { GetBookingResponseType } from 'extensions/calDotCom/lib/api/v2/schema'

jest.mock('../../../lib/api/v2/client')

describe('Cal.com - Get booking (v2 api)', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockedCalV2ApiClient = jest.mocked(CalV2ApiClient)
  const mockGetBooking = jest.fn()

  beforeEach(() => {
    clearMocks()
  })

  beforeAll(() => {
    mockedCalV2ApiClient.mockImplementation(() => {
      return {
        getBooking: mockGetBooking,
      } as unknown as CalV2ApiClient
    })
  })

  describe('When the request is successful', () => {
    beforeAll(() => {
      mockGetBooking.mockResolvedValue(getBookingMockResponse)
    })

    test('It should call the onComplete callback', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            bookingUid: 'booking_uid_123',
          },
          settings: {
            apiKey: 'apiKey',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          bookingData: JSON.stringify(getBookingMockResponse.data.data),
          eventTypeId: String(getBookingMockResponse.data.data.eventType.id),
          title: getBookingMockResponse.data.data.title,
          description: getBookingMockResponse.data.data.description,
          start: getBookingMockResponse.data.data.start,
          end: getBookingMockResponse.data.data.end,
          status: getBookingMockResponse.data.data.status,
          cancelUrl: `https://app.cal.com/booking/${getBookingMockResponse.data.data.uid}?cancel=true`,
          rescheduleUrl: `https://app.cal.com/reschedule/${getBookingMockResponse.data.data.uid}`,
          firstAttendeeEmail:
            getBookingMockResponse.data.data.attendees[0].email,
          firstAttendeeTimezone:
            getBookingMockResponse.data.data.attendees[0].timeZone,
          firstAttendeeName: getBookingMockResponse.data.data.attendees[0].name,
          location: getBookingMockResponse.data.data.location,
          bookingFieldsResponses: JSON.stringify(
            getBookingMockResponse.data.data.bookingFieldsResponses,
          ),
          metadata: JSON.stringify(getBookingMockResponse.data.data.metadata),
        },
      })
    })
  })

  describe('When the request is not successful', () => {
    describe('When status is error', () => {
      beforeAll(() => {
        mockGetBooking.mockResolvedValue({
          data: {
            status: 'error',
            // @ts-ignore fine for the test
            data: {},
            error: {
              message: 'Error message',
            },
          },
        } satisfies AxiosResponse<GetBookingResponseType>)
      })

      test('It should call the onError callback', async () => {
        await extensionAction.onEvent({
          payload: {
            fields: {
              bookingUid: 'booking_uid_123',
            },
            settings: {
              apiKey: 'apiKey',
            },
          } as any,
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalled()
      })
    })

    describe('When the Zoom API throws an error', () => {
      beforeAll(() => {
        mockGetBooking.mockRejectedValue(
          createAxiosError(404, 'Not found', JSON.stringify({})),
        )
      })

      test('It should throw an AxiosError', async () => {
        // Error is handled in Extensions Core and thrown to the user in the UI
        expect(
          extensionAction.onEvent({
            payload: {
              fields: {
                bookingUid: 'booking_uid_123',
              },
              settings: {
                apiKey: 'apiKey',
              },
            } as any,
            onComplete,
            onError,
            helpers,
          }),
        ).rejects.toThrow(AxiosError)
      })
    })
  })
})
