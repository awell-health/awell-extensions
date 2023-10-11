import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk } from '../../gql/__mocks__/sdk'
import { getMostRecentMetricEntry } from '../getMostRecentMetricEntry'

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

  test('Should get most recent metric entry', async () => {
    await getMostRecentMetricEntry.onActivityCreated(
      generateTestPayload({
        fields: {
          category: 'Weight',
        },
        settings: {
          apiKey: 'api-key',
          apiUrl: 'api-url',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toBeCalledTimes(1)
    expect(onError).toBeCalledTimes(0)
  })
})
