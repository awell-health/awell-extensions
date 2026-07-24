import { generateTestPayload } from '@/tests'
import { generateRandomNumber } from './generateRandomNumber'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Generate random number', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(generateRandomNumber)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        min: 15,
        max: 30,
      },
      settings: {},
    })

    await generateRandomNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onError if fields.min is undefined', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        min: undefined,
        max: 30,
      },
      settings: {},
    })

    await generateRandomNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalled()
  })
  test('Should call onError if fields.max is undefined', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        min: 15,
        max: undefined,
      },
      settings: {},
    })

    await generateRandomNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalled()
  })
  test('Check for difference between min and max', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        min: 42,
        max: 42,
      },
      settings: {},
    })

    await generateRandomNumber.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        generatedNumber: '42',
      },
    })
  })
})
