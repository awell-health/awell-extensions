import { listApis } from '../extensions/apigee/actions'
import { generateTestPayload } from './constants'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - listApis', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockListApis = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      listApis: mockListApis,
    } as any))
  })

  test('Should call onComplete with correct datapoints', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockListApis.mockResolvedValue({
      proxies: ['foo', 'bar'],
    })

    await listApis.onActivityCreated!(
      generateTestPayload({
        fields: {},
        settings: {
          gcpProjectId: 'test-project',
          apigeeOrgId: 'test-org',
          credentialsStrategy: 'ADC',
        },
      }),
      onComplete,
      onError,
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        proxies: JSON.stringify(['foo', 'bar']),
        proxyCount: '2',
        organizationId: 'test-org',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when API call fails', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockListApis.mockRejectedValue(new Error('API Error'))

    await listApis.onActivityCreated!(
      generateTestPayload({
        fields: {},
        settings: {
          gcpProjectId: 'test-project',
          apigeeOrgId: 'test-org',
          credentialsStrategy: 'ADC',
        },
      }),
      onComplete,
      onError,
    )

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to list Apigee APIs: API Error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API Error',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should handle empty proxy list', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockListApis.mockResolvedValue({
      proxies: [],
    })

    await listApis.onActivityCreated!(
      generateTestPayload({
        fields: {},
        settings: {
          gcpProjectId: 'test-project',
          apigeeOrgId: 'test-org',
          credentialsStrategy: 'ADC',
        },
      }),
      onComplete,
      onError,
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        proxies: JSON.stringify([]),
        proxyCount: '0',
        organizationId: 'test-org',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
