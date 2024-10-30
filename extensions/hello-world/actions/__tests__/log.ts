import { log } from '../'
import { generateTestPayload } from '@/tests'

describe('HelloWorld - log', () => {
  test('Should call onComplete', async () => {
    const onComplete = jest.fn()
    await log.onActivityCreated!(
      generateTestPayload({
        fields: {
          hello: 'Some text',
        },
        settings: {
          secret: 'secret-value',
        },
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onComplete if fields are undefined', async () => {
    const onComplete = jest.fn()
    await log.onActivityCreated!(
      generateTestPayload({
        fields: {
          hello: undefined,
        },
        settings: {
          secret: 'secret-value',
        },
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onComplete if settings are undefined', async () => {
    const onComplete = jest.fn()
    await log.onActivityCreated!(
      generateTestPayload({
        fields: {
          hello: 'Some text',
        },
        settings: {
          secret: undefined,
        },
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
