import { generateTestPayload } from '../../../../../src/tests'
import { stopCareFlow } from './stopCareFlow'

jest.mock('../../sdk/awellSdk')

describe('Stop care flow', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await stopCareFlow.onActivityCreated(
      generateTestPayload({
        fields: {
          reason: 'Just because I can',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
