import { parseNumberToTextWithDictionary } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Parse number to text with dictionary', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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

    await parseNumberToTextWithDictionary.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

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

    await parseNumberToTextWithDictionary.onActivityCreated!(
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

    await parseNumberToTextWithDictionary.onActivityCreated!(
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

  test('Should parse number to text if dictionary is emtpy', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        number: 2,
        dictionary: JSON.stringify({}),
      },
      settings: {},
    })

    await parseNumberToTextWithDictionary.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

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

    await parseNumberToTextWithDictionary.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        text: '5',
      },
    })
  })
})
