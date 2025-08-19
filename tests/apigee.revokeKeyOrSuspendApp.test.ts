import { revokeKeyOrSuspendApp } from '../extensions/apigee/actions'
import { generateTestPayload } from './constants'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - revokeKeyOrSuspendApp', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockRevokeKeyOrSuspendApp = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      revokeKeyOrSuspendApp: mockRevokeKeyOrSuspendApp,
    } as any))
  })

  test('Should revoke specific key when keyId provided', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockRevokeKeyOrSuspendApp.mockResolvedValue({
      action: 'key_revoked',
      timestamp: '2023-12-31T23:59:59Z'
    })

    const payload = generateTestPayload({
      fields: {
        developerId: 'test-dev-id',
        appId: 'test-app-id',
        keyId: 'test-key-id',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await revokeKeyOrSuspendApp.onActivityCreated!(payload, onComplete, onError)

    expect(mockRevokeKeyOrSuspendApp).toHaveBeenCalledWith('test-org', 'test-dev-id', 'test-app-id', 'test-key-id')
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        action: 'key_revoked',
        timestamp: '2023-12-31T23:59:59Z',
        organizationId: 'test-org',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should suspend app when no keyId provided', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockRevokeKeyOrSuspendApp.mockResolvedValue({
      action: 'app_suspended',
      timestamp: '2023-12-31T23:59:59Z'
    })

    const payload = generateTestPayload({
      fields: {
        developerId: 'test-dev-id',
        appId: 'test-app-id',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await revokeKeyOrSuspendApp.onActivityCreated!(payload, onComplete, onError)

    expect(mockRevokeKeyOrSuspendApp).toHaveBeenCalledWith('test-org', 'test-dev-id', 'test-app-id', undefined)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        action: 'app_suspended',
        timestamp: '2023-12-31T23:59:59Z',
        organizationId: 'test-org',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle errors appropriately', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockRevokeKeyOrSuspendApp.mockRejectedValue(new Error('App not found'))

    const payload = generateTestPayload({
      fields: {
        developerId: 'test-dev-id',
        appId: 'missing-app-id',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await revokeKeyOrSuspendApp.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to revoke key or suspend app: App not found' },
          error: {
            category: 'SERVER_ERROR',
            message: 'App not found',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
