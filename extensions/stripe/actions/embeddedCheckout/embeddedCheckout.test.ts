import { embeddedCheckout } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('../../api/client')

describe('Stripe - Embedded checkout', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a subscription', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        mode: 'payment',
        item: 'price_1PDTeoJvYdJ7UEuEG3rPlTPq',
      },
      settings: mockSettings,
    })

    await embeddedCheckout.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
  })
})
