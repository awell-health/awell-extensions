import { parseTextToNumber } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Parse text to number', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should parse integer to serialized number', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        text: '1',
      },
      settings: {},
    })

    await parseTextToNumber.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

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

    await parseTextToNumber.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

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

    await parseTextToNumber.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        number: 'NaN',
      },
    })
  })
})
