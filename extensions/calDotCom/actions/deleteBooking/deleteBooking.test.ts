import { deleteBooking } from './deleteBooking'
import { generateTestPayload } from '@/tests'
import { mockReturnValue, sampleBooking } from '../../__mocks__/calComApi'

jest.mock('../../calComApi', () => jest.fn(() => mockReturnValue))

describe('Delete booking', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      bookingId: String(sampleBooking.id),
      allRemainingBookings: undefined,
      reason: undefined,
    },
    settings: {
      apiKey: 'abc123',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await deleteBooking.onActivityCreated!(basePayload, onComplete, onError)

    expect(mockReturnValue.deleteBooking).toHaveBeenCalledWith(
      String(sampleBooking.id),
      { allRemainingBookings: undefined, cancellationReason: undefined }
    )
    expect(onComplete).toHaveBeenCalledWith()
  })
})
