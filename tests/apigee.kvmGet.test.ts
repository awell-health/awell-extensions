import { kvmGet } from '../extensions/apigee/actions'
import { generateTestPayload } from './constants'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - kvmGet', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockKvmGet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      kvmGet: mockKvmGet,
    } as any))
  })

  test('Should get KVM entry successfully', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockKvmGet.mockResolvedValue({
      value: 'test-value-123'
    })

    const payload = generateTestPayload({
      fields: {
        environment: 'prod',
        mapName: 'config',
        key: 'api_key',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await kvmGet.onActivityCreated!(payload, onComplete, onError)

    expect(mockKvmGet).toHaveBeenCalledWith('test-org', 'prod', 'config', 'api_key')
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        value: 'test-value-123',
        key: 'api_key',
        environment: 'prod',
        mapName: 'config',
        organizationId: 'test-org',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle errors appropriately', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockKvmGet.mockRejectedValue(new Error('Key not found'))

    const payload = generateTestPayload({
      fields: {
        environment: 'prod',
        mapName: 'config',
        key: 'missing_key',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await kvmGet.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to get key-value map entry: Key not found' },
          error: {
            category: 'SERVER_ERROR',
            message: 'Key not found',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
