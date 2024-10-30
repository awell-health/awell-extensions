import { parseDateToUnixTimestamp } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Parse date to unix timestamp', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should parse integer to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        date: '2023-10-05T07:55:13.573Z',
      },
      settings: {},
    })

    await parseDateToUnixTimestamp.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        unixTimestamp: '1696492513',
      },
    })
  })
})
