import { generateTestPayload } from '../../../../../src/tests'
import { startCareFlow } from './updateBaselineInfo'

jest.mock('../../sdk/awellSdk')

describe('Update baseline info', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await startCareFlow.onActivityCreated(
      generateTestPayload({
        fields: {
          baselineInfo: JSON.stringify([
            {
              data_point_definition_id: 'an-id',
              value: 'a-value',
            },
          ]),
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
        pathway: {
          id: 'a-pathway-id',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
  test('Should call the onError callback', async () => {
    await startCareFlow.onActivityCreated(
      generateTestPayload({
        fields: {
          baselineInfo: '',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
        pathway: {
          id: 'a-pathway-id',
        },
      }),
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
