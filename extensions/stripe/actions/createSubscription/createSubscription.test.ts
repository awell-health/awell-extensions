import { createSubscription } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

// jest.mock('../../api/client')

/**
 * Mock isn't working yet
 */
describe.skip('Stripe - Create subscription', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createSubscription)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a subscription', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        customer: 'cus_Q3advyWTRn52YQ',
        item: 'price_1PDTeoJvYdJ7UEuEG3rPlTPq',
      },
      settings: mockSettings,
    })

    await createSubscription.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        subscriptionId: 'subscription-id',
      },
    })
  })
})
