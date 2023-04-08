import { startCareFlow } from './startCareFlow'

jest.mock('../../sdk/awellSdk')

describe('Start care flow', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await startCareFlow.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          pathwayDefinitionId: 'a-pathway-definition-id',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
