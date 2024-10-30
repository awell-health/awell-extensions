import { createSubscription } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'

// jest.mock('../../api/client')

/**
 * Mock isn't working yet
 */
describe.skip('Stripe - Create subscription', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a subscription', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        customer: 'cus_Q3advyWTRn52YQ',
        item: 'price_1PDTeoJvYdJ7UEuEG3rPlTPq',
      },
      settings: mockSettings,
    })

    await createSubscription.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        subscriptionId: 'subscription-id',
      },
    })
  })
})
