import { failoWorld } from '../'
import { generateTestPayload } from '@/tests'

describe('HelloWorld - failoWorld', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const helpers = {
    log: jest.fn(),
    awellSdk: jest.fn(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should fail when attempt is less than or equal to failureAttempts', async () => {
    await failoWorld.onEvent!({
      payload: generateTestPayload({
        fields: {
          failureAttempts: 3,
        },
        settings: {
          clear: 'test-clear-value',
          secret: 'test-secret-value',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 2,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Attempt 2 of 3 - Intentionally failing for testing retry mechanism',
          },
          error: {
            category: 'SERVER_ERROR',
            message: 'This is intentional failure #2',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should succeed when attempt is greater than failureAttempts', async () => {
    await failoWorld.onEvent!({
      payload: generateTestPayload({
        fields: {
          failureAttempts: 2,
        },
        settings: {
          clear: 'test-clear-value',
          secret: 'test-secret-value',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 3,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        currentAttempt: '3',
        result: 'Success on attempt 3 after 2 failures',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should succeed immediately when failureAttempts is 0', async () => {
    await failoWorld.onEvent!({
      payload: generateTestPayload({
        fields: {
          failureAttempts: 0,
        },
        settings: {
          clear: 'test-clear-value',
          secret: 'test-secret-value',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        currentAttempt: '1',
        result: 'Success on attempt 1 after 0 failures',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
