import { createCustomer } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/client')

/**
 * Mock isn't working yet
 */
describe.skip('Stripe - Create customer', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createCustomer)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a subscription', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        email: 'nick+nickske@awellhealth.com',
        name: 'Nick Hellemans',
      },
      settings: mockSettings,
    })

    await createCustomer.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        customerId: 'new-customer-id',
      },
    })
  })
})
