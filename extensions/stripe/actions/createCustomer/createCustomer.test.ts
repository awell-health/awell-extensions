import { createCustomer } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('../../api/client')

/**
 * Mock isn't working yet
 */
describe.skip('Stripe - Create customer', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a subscription', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        email: 'nick+nickske@awellhealth.com',
        name: 'Nick Hellemans',
      },
      settings: mockSettings,
    })

    await createCustomer.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        customerId: 'new-customer-id',
      },
    })
  })
})
