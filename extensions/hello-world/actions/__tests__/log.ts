import { log } from '../'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('HelloWorld - log', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(log)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete with the correct data points', async () => {
    await log.onEvent!({
      payload: generateTestPayload({
        fields: {
          hello: 'Some text',
          secondField: 'Some text',
          thirdField: 123,
        },
        settings: {
          clear: 'clear-value',
          secret: 'secret-value',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        clear: 'clear-value',
        secret: 'secret-value',
        world: 'Some text',
      },
    })
  })
  test('Should call onComplete if fields are undefined', async () => {
    await log.onEvent!({
      payload: generateTestPayload({
        fields: {
          hello: undefined,
          secondField: undefined,
          thirdField: undefined,
        },
        settings: {
          clear: 'clear-value',
          secret: 'secret-value',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onComplete if settings are undefined', async () => {
    await log.onEvent!({
      payload: generateTestPayload({
        fields: {
          hello: 'Some text',
          secondField: 'Some text',
          thirdField: 123,
        },
        settings: {
          clear: undefined,
          secret: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
