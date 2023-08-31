import { updateBooking } from './updateBooking'
import { generateTestPayload } from '../../../../src/tests'

jest.mock('../../client')

describe('Update booking', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      bookingId: '123',
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

    expect(onComplete).toHaveBeenCalled()
  })
})
