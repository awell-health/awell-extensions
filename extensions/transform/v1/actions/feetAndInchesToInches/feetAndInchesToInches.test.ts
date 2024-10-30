import { feetAndInchesToInches } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Feet and inches to inches', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work with whole numbers', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        feet: 6,
        inches: 5,
      },
      settings: {},
    })

    await feetAndInchesToInches.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        inches: '77',
      },
    })
  })

  test('Should work with decimal numbers', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        feet: 6.1,
        inches: 5.4,
      },
      settings: {},
    })

    await feetAndInchesToInches.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        inches: '78.6',
      },
    })
  })
})
