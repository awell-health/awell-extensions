import { generateTestPayload } from './constants'
import { listApiProducts } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - listApiProducts', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockListApiProducts = jest.fn()
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      listApiProducts: mockListApiProducts,
    } as any))
  })

  test('Should list API products with details', async () => {
    mockListApiProducts.mockResolvedValue({
      products: [
        {
          name: 'product1',
          displayName: 'Product 1',
          description: 'First product',
          environments: ['prod', 'test'],
          proxies: ['proxy1'],
          scopes: ['read'],
          approvalType: 'auto'
        },
        {
          name: 'product2',
          displayName: 'Product 2',
          description: 'Second product',
          environments: ['prod'],
          proxies: ['proxy2'],
          scopes: ['write'],
          approvalType: 'manual'
        }
      ]
    })

    const payload = generateTestPayload({
      fields: {},
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await listApiProducts.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        products: JSON.stringify([
          {
            name: 'product1',
            displayName: 'Product 1',
            description: 'First product',
            environments: ['prod', 'test'],
            proxies: ['proxy1'],
            scopes: ['read'],
            approvalType: 'auto'
          },
          {
            name: 'product2',
            displayName: 'Product 2',
            description: 'Second product',
            environments: ['prod'],
            proxies: ['proxy2'],
            scopes: ['write'],
            approvalType: 'manual'
          }
        ]),
        productCount: '2',
        organizationId: 'test-org'
      }
    })
  })

  test('Should handle errors appropriately', async () => {
    mockListApiProducts.mockRejectedValue(new Error('API error'))

    const payload = generateTestPayload({
      fields: {},
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await listApiProducts.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to list Apigee API products: API error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API error'
          }
        }
      ]
    })
  })
})
