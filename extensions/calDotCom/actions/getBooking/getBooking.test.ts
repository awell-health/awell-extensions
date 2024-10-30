import { getBooking } from './getBooking'
import { faker } from '@faker-js/faker'
import CalComApi from '../../calComApi'
import { generateTestPayload } from '@/tests'
import type { User, Booking } from '../../schema'

describe('Cal.com GetBooking action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const dummyPayloadPart = {
    pathway: {
      id: faker.string.uuid(),
      definition_id: faker.string.uuid(),
    },
    activity: {
      id: faker.string.uuid(),
    },
    patient: { id: faker.string.uuid() },
  }
  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  describe('with empty apiKey', () => {
    it('should call onError', async () => {
      await getBooking.onActivityCreated!(
        generateTestPayload({
          ...dummyPayloadPart,
          fields: {
            bookingId: faker.string.uuid(),
          },
          settings: { apiKey: '' },
        }),
        onComplete,
        onError
      )
      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: {
              en: expect.stringContaining('Missing API key'),
            },
            error: {
              category: 'BAD_REQUEST',
              message: expect.stringContaining('Missing API key'),
            },
          },
        ],
      })
    })
  })

  describe('with empty bookingId', () => {
    it('should call onError', async () => {
      await getBooking.onActivityCreated!(
        generateTestPayload({
          ...dummyPayloadPart,
          fields: {
            bookingId: '',
          },
          settings: { apiKey: faker.string.uuid() },
        }),
        onComplete,
        onError
      )
      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: {
              en: expect.stringContaining('Missing bookingId'),
            },
            error: {
              category: 'BAD_REQUEST',
              message: expect.stringContaining('Missing bookingId'),
            },
          },
        ],
      })
    })
  })

  describe('with valid response', () => {
    let mockCalComApi: jest.SpyInstance
    let eventTypeId: number
    let title: string
    let description: string
    let startTime: string
    let endTime: string
    let status: string
    let id: number
    let uid: string
    let metadata: Booking['metadata']
    let user: User
    let attendees: User[]
    let responses: Booking['responses']

    beforeEach(() => {
      eventTypeId = faker.number.int()
      title = faker.word.sample()
      description = faker.word.sample()
      startTime = faker.date.anytime().toISOString()
      endTime = faker.date.anytime().toISOString()
      status = faker.string.sample()
      responses = {
        location: {
          value: 'inPerson',
        },
      }
      id = faker.number.int()
      uid = faker.string.uuid()
      metadata = {
        videoCallUrl: faker.internet.url(),
      }
      user = {
        email: faker.internet.email(),
        name: faker.word.sample(),
        timeZone: faker.word.sample(),
        locale: faker.word.sample(),
      }
      attendees = [
        {
          email: faker.internet.email(),
          name: faker.word.sample(),
          timeZone: faker.word.sample(),
        },
      ]

      mockCalComApi = jest
        .spyOn(CalComApi.prototype, 'getBooking')
        .mockResolvedValue({
          eventTypeId,
          title,
          description,
          startTime,
          endTime,
          status,
          id,
          uid,
          metadata,
          user,
          attendees,
          responses,
        })
    })

    afterEach(() => {
      mockCalComApi.mockRestore()
    })

    it('should call onComplete with data points', async () => {
      await getBooking.onActivityCreated!(
        generateTestPayload({
          ...dummyPayloadPart,
          fields: {
            bookingId: faker.string.uuid(),
          },
          settings: { apiKey: faker.string.uuid() },
        }),
        onComplete,
        onError
      )
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          eventTypeId: eventTypeId.toString(),
          title,
          description,
          startTime,
          endTime,
          status,
          cancelUrl: `https://app.cal.com/booking/${uid}?cancel=true`,
          rescheduleUrl: `https://app.cal.com/reschedule/${uid}`,
          videoCallUrl: metadata.videoCallUrl,
          firstAttendeeEmail: attendees[0].email,
          firstAttendeeTimezone: attendees[0].timeZone,
          location: 'inPerson',
          firstAttendeeName: attendees[0].name,
          userEmail: user.email,
        },
      })
    })
  })

  describe('with error thrown from CalComApi.getBooking', () => {
    let mockCalComApi: jest.SpyInstance
    let errorMessage: string

    beforeEach(() => {
      errorMessage = faker.word.words()
      mockCalComApi = jest
        .spyOn(CalComApi.prototype, 'getBooking')
        .mockRejectedValue(new Error(errorMessage))
    })

    afterEach(() => {
      mockCalComApi.mockRestore()
    })

    it('should call onComplete with data points', async () => {
      await getBooking.onActivityCreated!(
        generateTestPayload({
          ...dummyPayloadPart,
          fields: {
            bookingId: faker.string.uuid(),
          },
          settings: { apiKey: faker.string.uuid() },
        }),
        onComplete,
        onError
      )
      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
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
    })
  })
})
