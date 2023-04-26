import { hello } from '..'

jest.mock('../../exampleClient')

const samplePayload = {
  pathway: {
    id: 'pathway-id',
    definition_id: 'pathway-definition-id',
  },
  activity: { id: 'test-activity' },
  patient: { id: 'test-patient' },
  fields: {
    hello: 'Some text',
  },
  settings: {
    client_id: 'abc',
    client_secret: 'def',
    auth_url: 'https://example.com/auth/token',
    base_url: 'https://example.com/',
  },
}

describe('HelloWorld - log', () => {
  test('Should call onComplete', async () => {
    const onComplete = jest.fn()
    await hello.onActivityCreated(samplePayload, onComplete, jest.fn())
    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        world: 'Response: Some text',
      },
    })
  })
  test('Should call onComplete if fields.hello is undefined', async () => {
    const onComplete = jest.fn()
    await hello.onActivityCreated(
      {
        ...samplePayload,
        fields: {
          hello: undefined,
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        world: 'Response: world',
      },
    })
  })
  test('Should call onError if settings are undefined', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    await hello.onActivityCreated(
      {
        ...samplePayload,
        settings: undefined as unknown as typeof samplePayload.settings,
      },
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
  })
})
