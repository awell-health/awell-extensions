import { parseUnixTimestampToDate } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse unix timestamp to date', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    parseUnixTimestampToDate,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should parse integer to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        unixTimeStamp: 1,
      },
      settings: {},
    })

    await parseUnixTimestampToDate.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        date: '1970-01-01T00:00:01.000Z',
      },
    })
  })
})
