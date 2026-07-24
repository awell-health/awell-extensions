import { generateTestPayload } from '@/tests'
import { subtract } from './subtract'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Subtract', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(subtract)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await subtract.onEvent!({
      payload: generateTestPayload({
        fields: {
          minuend: 5,
          subtrahend: 10,
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
        difference: '-5',
        absoluteDifference: '5',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return an error if action fields are undefined', async () => {
    await subtract.onEvent!({
      payload: generateTestPayload({
        fields: {
          minuend: undefined,
          subtrahend: undefined,
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
