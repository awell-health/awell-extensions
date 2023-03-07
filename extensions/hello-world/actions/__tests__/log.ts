import { log } from '../'

describe('HelloWorld - log', () => {
  test('Should call done', async () => {
    const done = jest.fn()
    await log.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        fields: {
          text: 'Some text',
        },
        settings: {
          secret: 'secret-value',
        },
      },
      done
    )
    expect(done).toHaveBeenCalled()
  })
  test('Should call done if fields are undefined', async () => {
    const done = jest.fn()
    await log.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        fields: {
          text: undefined,
        },
        settings: {
          secret: 'secret-value',
        },
      },
      done
    )
    expect(done).toHaveBeenCalled()
  })
  test('Should call done if settings are undefined', async () => {
    const done = jest.fn()
    await log.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        fields: {
          text: 'Some text',
        },
        settings: {
          secret: undefined,
        },
      },
      done
    )
    expect(done).toHaveBeenCalled()
  })
})
