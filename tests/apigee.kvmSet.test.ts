import { generateTestPayload } from './constants'
import { kvmSet } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - kvmSet', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockKvmSet = jest.fn()
  const onComplete = jest.fn()
  const onError = jest.fn()
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      kvmSet: mockKvmSet,
    } as any))
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  test('Should set KVM entry and redact value in logs', async () => {
    mockKvmSet.mockResolvedValue({ success: true })

    const payload = generateTestPayload({
      fields: {
        environment: 'prod',
        mapName: 'config',
        key: 'api_key',
        value: 'secret-value-123'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await kvmSet.onActivityCreated!(payload, onComplete, onError)

    expect(mockKvmSet).toHaveBeenCalledWith('test-org', 'prod', 'config', 'api_key', 'secret-value-123')
    expect(consoleSpy).toHaveBeenCalledWith('Setting KVM entry for key: api_key, value: [REDACTED]')
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        success: 'true',
        key: 'api_key',
        environment: 'prod',
        mapName: 'config',
        organizationId: 'test-org'
      }
    })
  })

  test('Should handle errors appropriately', async () => {
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('API error')),
      interceptors: {
        request: { use: jest.fn() }
      }
    }
    mockAxios.create.mockReturnValue(mockClient)

    const payload = generateTestPayload({
      fields: {
        environment: 'prod',
        mapName: 'config',
        key: 'api_key',
        value: 'secret-value-123'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await kvmSet.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to set key-value map entry: API error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API error'
          }
        }
      ]
    })
  })
})
