import { log } from '../'
import { generateTestPayload } from '@/tests'

describe('HelloWorld - log', () => {
  test('Should call onComplete with the correct data points', async () => {
    const onComplete = jest.fn()
    await log.onActivityCreated!(
      generateTestPayload({
        fields: {
          hello: 'Some text',
          secondField: 'Some text',
        },
        settings: {
          clear: 'clear-value',
          secret: 'secret-value',
        },
      }),
      onComplete,
      jest.fn(),
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        clear: 'clear-value',
        secret: 'secret-value',
        world: 'Some text',
      },
    })
  })
  test('Should call onComplete if fields are undefined', async () => {
    const onComplete = jest.fn()
    await log.onActivityCreated!(
      generateTestPayload({
        fields: {
          hello: undefined,
          secondField: undefined,
        },
        settings: {
          clear: 'clear-value',
          secret: 'secret-value',
        },
      }),
      onComplete,
      jest.fn(),
    )
    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onComplete if settings are undefined', async () => {
    const onComplete = jest.fn()
    await log.onActivityCreated!(
      generateTestPayload({
        fields: {
          hello: 'Some text',
          secondField: 'Some text',
        },
        settings: {
          clear: undefined,
          secret: undefined,
        },
      }),
      onComplete,
      jest.fn(),
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
