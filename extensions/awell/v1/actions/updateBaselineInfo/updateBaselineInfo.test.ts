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
      mutation: jest.fn().mockResolvedValue({
        updateBaselineInfo: {
          success: true,
        },
      }),
    },
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback with the current careflow ID when no external careflow ID is provided', async () => {
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
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)

    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledWith({
      updateBaselineInfo: expect.objectContaining({
        __args: {
          input: {
            pathway_id: 'a-pathway-id',
            baseline_info: expect.any(Array),
          },
        },
      }),
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback with the given careflow ID when an external careflow ID is provided', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          careflowId: 'an-external-careflow-id',
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
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)

    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledWith({
      updateBaselineInfo: expect.objectContaining({
        __args: {
          input: {
            pathway_id: 'an-external-careflow-id',
            baseline_info: expect.any(Array),
          },
        },
      }),
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
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
      attempt: 1,
    })
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
