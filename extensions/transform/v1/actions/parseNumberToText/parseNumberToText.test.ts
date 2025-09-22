import { parseNumberToText } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse text to number', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(parseNumberToText)

  beforeEach(() => {
    clearMocks()
  })

  test('Should parse number to text', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 1,
      },
      settings: {},
    })

    await parseNumberToText.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

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

    await parseNumberToText.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: 'NaN',
      },
    })
  })
})
