import { updateBooking } from './updateBooking'
import { generateTestPayload } from '@/tests'
import { mockReturnValue, sampleBooking } from '../../__mocks__/calComApi'

jest.mock('../../calComApi', () => jest.fn(() => mockReturnValue))

describe('Update booking', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      bookingId: String(sampleBooking.id),
      title: sampleBooking.title,
      description: undefined,
      status: sampleBooking.status,
      start: sampleBooking.startTime,
      end: sampleBooking.endTime,
    },
    settings: {
      apiKey: 'abc123',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await updateBooking.onActivityCreated!(basePayload, onComplete, onError)

    expect(mockReturnValue.updateBooking).toHaveBeenCalledWith(
      String(sampleBooking.id),
      {
        title: sampleBooking.title,
        description: undefined,
        status: sampleBooking.status,
        start: sampleBooking.startTime,
        end: sampleBooking.endTime,
      }
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bookingId: String(sampleBooking.id),
        bookingUid: sampleBooking.uid,
      },
    })
  })
})
