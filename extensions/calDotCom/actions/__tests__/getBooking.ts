import { getBooking } from '../getBooking'
import { faker } from '@faker-js/faker'
import CalComApi from '../../calComApi'
import { generateTestPayload } from '../../../../src/tests'

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
      expect.assertions(1)
      try {
        await getBooking.onActivityCreated(
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
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('with empty bookingId', () => {
    it('should call onError', async () => {
      expect.assertions(1)
      try {
        await getBooking.onActivityCreated(
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
      } catch (error) {
        expect(error).toBeDefined()
      }
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
    let uid: string

    beforeEach(() => {
      eventTypeId = faker.number.int()
      title = faker.word.sample()
      description = faker.word.sample()
      startTime = faker.date.anytime().toISOString()
      endTime = faker.date.anytime().toISOString()
      status = faker.string.sample()
      uid = faker.string.uuid()
      mockCalComApi = jest
        .spyOn(CalComApi.prototype, 'getBooking')
        .mockResolvedValue({
          eventTypeId,
          title,
          description,
          startTime,
          endTime,
          status,
          uid,
        })
    })

    afterEach(() => {
      mockCalComApi.mockRestore()
    })

    it('should call onComplete with data points', async () => {
      await getBooking.onActivityCreated(
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
      expect.assertions(1)
      try {
        await getBooking.onActivityCreated(
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
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
