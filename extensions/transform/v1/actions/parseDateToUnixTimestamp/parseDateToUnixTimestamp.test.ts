import { parseDateToUnixTimestamp } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse date to unix timestamp', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    parseDateToUnixTimestamp,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should parse integer to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        date: '2023-10-05T07:55:13.573Z',
      },
      settings: {},
    })

    await parseDateToUnixTimestamp.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        unixTimestamp: '1696492513',
      },
    })
  })
})
