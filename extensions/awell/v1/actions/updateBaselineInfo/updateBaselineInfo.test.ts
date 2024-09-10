import { TestHelpers } from '@awell-health/extensions-core'
import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { updateBaselineInfo } from './updateBaselineInfo'

jest.mock('../../sdk/awellSdk')

describe('Update baseline info', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(updateBaselineInfo)
  const sdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({}),
    },
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          baselineInfo: JSON.stringify([
            {
              data_point_definition_id: 'an-id',
              value: 'a-value',
            },
          ]),
        },
        settings: {},
        pathway: {
          id: 'a-pathway-id',
        },
      }),
      onComplete,
      onError,
      helpers,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
  test('Should throw an error', async () => {
    const resp = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          baselineInfo: '',
        },
        settings: {},
        pathway: {
          id: 'a-pathway-id',
        },
      }),
      onComplete,
      onError,
      helpers,
    })
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
