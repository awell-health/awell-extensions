import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import AwellSdk from '../../sdk/awellSdk'
import { pauseCareFlow } from './pauseCareFlow'

jest.mock('../../sdk/awellSdk')

describe('Pause care flow', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(pauseCareFlow)
  const pauseMock = jest
    .spyOn(AwellSdk.prototype, 'pauseCareFlow')
    .mockResolvedValue(true)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  describe('When pausing the current care flow', () => {
    test('Should pause the care flow of the payload and call onComplete', async () => {
      const payload = generateTestPayload({
        fields: {
          careFlowIds: undefined,
          reason: 'Patient asked for a break',
        },
        settings: {},
      })

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(pauseMock).toHaveBeenCalledTimes(1)
      expect(pauseMock).toHaveBeenCalledWith({
        careflow_id: payload.pathway.id,
        reason: 'Patient asked for a break',
      })
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    test('Should fall back to a default reason when none is provided', async () => {
      const payload = generateTestPayload({
        fields: {
          careFlowIds: undefined,
          reason: undefined,
        },
        settings: {},
      })

      await extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(pauseMock).toHaveBeenCalledWith({
        careflow_id: payload.pathway.id,
        reason: 'Default message: Paused by extension.',
      })
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('When pausing multiple care flows', () => {
    test('Should pause each care flow and call onComplete', async () => {
      jest.useFakeTimers()

      const promise = extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            careFlowIds: '123, 456',
            reason: 'Subscription ended',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
      await jest.runAllTimersAsync()
      await promise
      jest.useRealTimers()

      expect(pauseMock).toHaveBeenCalledTimes(2)
      expect(pauseMock).toHaveBeenCalledWith({
        careflow_id: '123',
        reason: 'Subscription ended',
      })
      expect(pauseMock).toHaveBeenCalledWith({
        careflow_id: '456',
        reason: 'Subscription ended',
      })
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('When the API call fails', () => {
    test('Should call onError', async () => {
      pauseMock.mockRejectedValueOnce(new Error('Pause care flow failed.'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            careFlowIds: undefined,
            reason: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            error: {
              category: 'SERVER_ERROR',
              message: 'Pause care flow failed.',
            },
          }),
        ],
      })
    })
  })
})
