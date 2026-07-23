import { feetAndInchesToInches } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Feet and inches to inches', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    feetAndInchesToInches,
  )

  beforeEach(() => {
    clearMocks()
  })

  test('Should work with whole numbers', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        feet: 6,
        inches: 5,
      },
      settings: {},
    })

    await feetAndInchesToInches.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

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

    await feetAndInchesToInches.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        inches: '78.6',
      },
    })
  })
})
