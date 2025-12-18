import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { stopCareFlow } from './stopCareFlow'

jest.mock('../../sdk/awellSdk')

describe('Stop care flow', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(stopCareFlow)
  const sdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({}),
    },
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  describe('When stopping the current care flow', () => {
    test('Should call the onComplete callback', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            reason: 'Just because I can',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalled()
      expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
      expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When stopping multiple care flows', () => {
    test('Should call the onComplete callback', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            careFlowIds: '123,456',
            reason: 'Just because I can',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalled()
      expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
      expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(2)
      expect(sdkMock.orchestration.mutation).toHaveBeenCalledWith({
        stopPathway: {
          __args: {
            input: {
              pathway_id: '123',
              reason: 'Just because I can',
            },
          },
          code: true,
          success: true,
        },
      })
      expect(sdkMock.orchestration.mutation).toHaveBeenCalledWith({
        stopPathway: {
          __args: {
            input: {
              pathway_id: '456' ,
              reason: 'Just because I can',
            },
          },
          code: true,
          success: true,
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })
})
