import { createBooking } from './createBooking'
import { generateTestPayload } from '@/tests'
import { mockReturnValue, sampleBooking } from '../../__mocks__/calComApi'

jest.mock('../../calComApi', () => jest.fn(() => mockReturnValue))

describe('Create booking', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      eventTypeId: sampleBooking.eventTypeId,
      start: sampleBooking.startTime,
      end: sampleBooking.endTime,
      responses: JSON.stringify(sampleBooking.responses),
      metadata: JSON.stringify({}),
      timeZone: sampleBooking.timeZone,
      language: sampleBooking.language,
      title: sampleBooking.title,
      recurringEventId: undefined,
      description: undefined,
      status: sampleBooking.status,
    },
    settings: {
      apiKey: 'abc123',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await createBooking.onActivityCreated!(basePayload, onComplete, onError)

    expect(mockReturnValue.createBooking).toHaveBeenCalledWith({
      eventTypeId: sampleBooking.eventTypeId,
      start: sampleBooking.startTime,
      end: sampleBooking.endTime,
      responses: sampleBooking.responses,
      metadata: {},
      timeZone: sampleBooking.timeZone,
      language: sampleBooking.language,
      title: sampleBooking.title,
      recurringEventId: undefined,
      description: undefined,
      status: sampleBooking.status,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bookingId: String(sampleBooking.id),
      },
    })
  })
})
