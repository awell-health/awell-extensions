import { listApis } from '../extensions/apigee/actions'
import { generateTestPayload } from './constants'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('google-auth-library', () => ({
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue('ya.fake.token'),
  })),
}))

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
    },
    get: jest.fn(),
  })),
  AxiosHeaders: {
    from: jest.fn(() => ({ set: jest.fn() })),
  },
}))

jest.mock('../extensions/apigee/client')

describe('Apigee - listApis', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(ApigeeApiClient as jest.MockedClass<typeof ApigeeApiClient>).mockImplementation(() => ({
      listApis: jest.fn().mockResolvedValue({
        proxies: ['foo', 'bar'],
      }),
      getAccessToken: jest.fn().mockResolvedValue('ya.fake.token'),
    } as any))
  })

  test('Should call onComplete with correct datapoints', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

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

    ;(ApigeeApiClient as jest.MockedClass<typeof ApigeeApiClient>).mockImplementation(() => ({
      listApis: jest.fn().mockRejectedValue(new Error('API Error')),
      getAccessToken: jest.fn().mockResolvedValue('ya.fake.token'),
    } as any))

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

    ;(ApigeeApiClient as jest.MockedClass<typeof ApigeeApiClient>).mockImplementation(() => ({
      listApis: jest.fn().mockResolvedValue({
        proxies: [],
      }),
      getAccessToken: jest.fn().mockResolvedValue('ya.fake.token'),
    } as any))

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
