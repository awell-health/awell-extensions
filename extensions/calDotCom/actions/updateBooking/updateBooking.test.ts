import { updateBooking } from './updateBooking'
import { generateTestPayload } from '../../../../src/tests'
import { sampleBooking } from '../../__mocks__/calComApi'

jest.mock('../../calComApi')

describe('Update booking', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      bookingId: String(sampleBooking.id),
      title: undefined,
      description: undefined,
      status: undefined,
      start: undefined,
      end: undefined,
    },
    settings: {
      apiKey: 'abc123',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await updateBooking.onActivityCreated(basePayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bookingId: String(sampleBooking.id),
        bookingUid: sampleBooking.uid,
      },
    })
  })
})
