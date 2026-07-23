import { generateTestPayload } from '@/tests'
import { divide } from './divide'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Divide', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(divide)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await divide.onEvent!({
      payload: generateTestPayload({
        fields: {
          dividend: 10,
          divisor: 5,
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        quotient: '2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return an error if action fields are undefined', async () => {
    await divide.onEvent!({
      payload: generateTestPayload({
        fields: {
          dividend: undefined,
          divisor: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: expect.objectContaining({
            category: 'SERVER_ERROR',
            message: expect.any(String),
          }),
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
