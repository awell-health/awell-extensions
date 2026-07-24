import { parseTextToNumber } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse text to number', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(parseTextToNumber)

  beforeEach(() => {
    clearMocks()
  })

  test('Should parse integer to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        text: '1',
      },
      settings: {},
    })

    await parseTextToNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        number: '1',
      },
    })
  })

  test('Should parse float to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        text: '1.5',
      },
      settings: {},
    })

    await parseTextToNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        number: '1.5',
      },
    })
  })

  test('Should parse to serialized NaN', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        text: 'Not a number',
      },
      settings: {},
    })

    await parseTextToNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        number: 'NaN',
      },
    })
  })
})
