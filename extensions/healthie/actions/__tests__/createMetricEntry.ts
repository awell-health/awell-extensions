import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk } from '../../gql/__mocks__/sdk'
import { createMetricEntry } from '../createMetricEntry'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('createMetricEntry action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a metric entry', async () => {
    await createMetricEntry.onActivityCreated(
      generateTestPayload({
        fields: {
          userId: '60',
          category: 'Weight',
          metricStat: '182',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledTimes(1)
    expect(onError).toBeCalledTimes(0)
  })
})
