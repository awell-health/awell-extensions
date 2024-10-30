import { parseUnixTimestampToDate } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Parse unix timestamp to date', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should parse integer to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        unixTimeStamp: 1,
      },
      settings: {},
    })

    await parseUnixTimestampToDate.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        date: '1970-01-01T00:00:01.000Z',
      },
    })
  })
})
