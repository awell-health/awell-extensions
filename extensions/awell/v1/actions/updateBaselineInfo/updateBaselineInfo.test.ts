import { generateTestPayload } from '../../../../../src/tests'
import { updateBaselineInfo } from './updateBaselineInfo'

jest.mock('../../sdk/awellSdk')

describe('Update baseline info', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await updateBaselineInfo.onActivityCreated(
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
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
  test('Should call the onError callback', async () => {
    const resp = updateBaselineInfo.onActivityCreated(
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
    await expect(resp).rejects.toThrowError()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
