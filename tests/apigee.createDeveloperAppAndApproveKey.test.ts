import { generateTestPayload } from './constants'
import { createDeveloperAppAndApproveKey } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - createDeveloperAppAndApproveKey', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockCreateDeveloperAppAndApproveKey = jest.fn()
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      createDeveloperAppAndApproveKey: mockCreateDeveloperAppAndApproveKey,
    } as any))
  })

  test('Should return existing app when app already exists', async () => {
    mockCreateDeveloperAppAndApproveKey.mockResolvedValue({
      appId: 'existing-app-id',
      keyId: 'existing-key-123',
      consumerKey: 'existing-key-123',
      consumerSecret: 'existing-secret-456',
      boundProducts: ['product1', 'product2']
    })

    const payload = generateTestPayload({
      fields: {
        developerId: 'test@example.com',
        appName: 'my-app',
        apiProducts: 'product1,product2'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await createDeveloperAppAndApproveKey.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appId: 'existing-app-id',
        keyId: 'existing-key-123',
        consumerKey: 'existing-key-123',
        boundProducts: JSON.stringify(['product1', 'product2']),
        organizationId: 'test-org'
      }
    })
  })

  test('Should create new app when app does not exist', async () => {
    mockCreateDeveloperAppAndApproveKey.mockResolvedValue({
      appId: 'new-app-id',
      keyId: 'new-key-789',
      consumerKey: 'new-key-789',
      consumerSecret: 'new-secret-012',
      boundProducts: ['product1', 'product2']
    })

    const payload = generateTestPayload({
      fields: {
        developerId: 'test@example.com',
        appName: 'my-app',
        apiProducts: 'product1,product2'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await createDeveloperAppAndApproveKey.onActivityCreated!(payload, onComplete, onError)

    expect(mockCreateDeveloperAppAndApproveKey).toHaveBeenCalledWith('test-org', 'test@example.com', 'my-app', ['product1', 'product2'])
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appId: 'new-app-id',
        keyId: 'new-key-789',
        consumerKey: 'new-key-789',
        consumerSecret: 'new-secret-012',
        boundProducts: 'product1,product2',
        organizationId: 'test-org'
      }
    })
  })

  test('Should handle errors appropriately', async () => {
    mockCreateDeveloperAppAndApproveKey.mockRejectedValue(new Error('API Error'))

    const payload = generateTestPayload({
      fields: {
        developerId: 'test@example.com',
        appName: 'my-app',
        apiProducts: 'product1'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await createDeveloperAppAndApproveKey.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to create developer app and approve key: API Error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API Error',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
