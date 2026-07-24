import { parseNumberToTextWithDictionary } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse number to text with dictionary', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    parseNumberToTextWithDictionary,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should parse number to text if mapping is found in dict', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 1,
        dictionary: JSON.stringify({
          '1': 'hello world',
        }),
      },
      settings: {},
    })

    await parseNumberToTextWithDictionary.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: 'hello world',
      },
    })
  })

  test('Should parse NaN to text', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: NaN,
        dictionary: JSON.stringify({
          '1': 'hello world',
        }),
      },
      settings: {},
    })

    await parseNumberToTextWithDictionary.onEvent!({
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

  test('Should parse number to text if no mapping is found in the dictionary', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 1,
        dictionary: JSON.stringify({
          '2': 'hello world',
        }),
      },
      settings: {},
    })

    await parseNumberToTextWithDictionary.onEvent!({
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

  test('Should parse number to text if dictionary is emtpy', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 2,
        dictionary: JSON.stringify({}),
      },
      settings: {},
    })

    await parseNumberToTextWithDictionary.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: '2',
      },
    })
  })

  test('Should parse number to text even if dictionary has number value', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 2,
        dictionary: JSON.stringify({ 2: 5 }),
      },
      settings: {},
    })

    await parseNumberToTextWithDictionary.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: '5',
      },
    })
  })
})
