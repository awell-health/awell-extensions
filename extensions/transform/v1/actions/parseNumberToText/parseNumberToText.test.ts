import { parseNumberToText } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Parse text to number', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should parse number to text', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 1,
      },
      settings: {},
    })

    await parseNumberToText.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: '1',
      },
    })
  })

  test('Should parse NaN to text', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: NaN,
      },
      settings: {},
    })

    await parseNumberToText.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: 'NaN',
      },
    })
  })
})
