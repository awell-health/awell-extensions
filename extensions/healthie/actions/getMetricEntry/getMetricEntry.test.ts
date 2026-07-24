import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { mockGetSdk } from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { getMetricEntry } from '.'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('Healthie - Get metric entry', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getMetricEntry)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should get most recent metric entry', async () => {
    await getMetricEntry.onEvent!({
      payload: generateTestPayload({
        fields: {
          patientId: '123',
          category: 'Weight',
        },
        settings: {
          apiKey: 'api-key',
          apiUrl: 'api-url',
          formAnswerMaxSizeKB: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        metricId: '714884',
        metricValue: '190',
        createdAt: '2023-10-06T10:08:34.000Z',
      },
    })
    expect(onError).toBeCalledTimes(0)
  })
})
