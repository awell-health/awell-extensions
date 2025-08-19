import { opsSnapshot } from '../extensions/apigee/actions'
import { generateTestPayload } from './constants'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - opsSnapshot', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockOpsSnapshot = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      opsSnapshot: mockOpsSnapshot,
    } as any))
  })

  test('Should provide operational metrics snapshot', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockOpsSnapshot.mockResolvedValue({
      oneHour: { total: 1000, errorRate: 0.02, p95: 250 },
      twentyFourHour: { total: 24000, errorRate: 0.015, p95: 300 }
    })

    const payload = generateTestPayload({
      fields: {
        environment: 'prod',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await opsSnapshot.onActivityCreated!(payload, onComplete, onError)

    expect(mockOpsSnapshot).toHaveBeenCalledWith('test-org', 'prod')
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        oneHourStats: JSON.stringify({ total: 1000, errorRate: 0.02, p95: 250 }),
        twentyFourHourStats: JSON.stringify({ total: 24000, errorRate: 0.015, p95: 300 }),
        environment: 'prod',
        organizationId: 'test-org',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle errors appropriately', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockOpsSnapshot.mockRejectedValue(new Error('Environment not found'))

    const payload = generateTestPayload({
      fields: {
        environment: 'missing-env',
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'ADC',
      },
    })

    await opsSnapshot.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to get operations snapshot: Environment not found' },
          error: {
            category: 'SERVER_ERROR',
            message: 'Environment not found',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
