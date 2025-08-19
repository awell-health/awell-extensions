import { generateTestPayload } from './constants'
import { listProxiesWithDeployments } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - listProxiesWithDeployments', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockListProxiesWithDeployments = jest.fn()
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      listProxiesWithDeployments: mockListProxiesWithDeployments,
    } as any))
  })

  test('Should list proxies with deployment information', async () => {
    mockListProxiesWithDeployments.mockResolvedValue({
      proxies: ['proxy1', 'proxy2'],
      proxyCount: 2,
      totalDeployments: 3,
    })

    const payload = generateTestPayload({
      fields: {},
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await listProxiesWithDeployments.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        proxies: JSON.stringify(['proxy1', 'proxy2']),
        proxyCount: '2',
        totalDeployments: '3',
        organizationId: 'test-org'
      }
    })
  })

  test('Should handle errors appropriately', async () => {
    const mockClient = {
      get: jest.fn().mockRejectedValue(new Error('API error')),
      interceptors: {
        request: { use: jest.fn() }
      }
    }
    mockAxios.create.mockReturnValue(mockClient)

    const payload = generateTestPayload({
      fields: {},
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await listProxiesWithDeployments.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to list Apigee proxies with deployments: API error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API error'
          }
        }
      ]
    })
  })
})
