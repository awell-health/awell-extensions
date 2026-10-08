import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import AwellSdk from '../../sdk/awellSdk'
import { unpauseCareFlow } from './unpauseCareFlow'

jest.mock('../../sdk/awellSdk')

describe('Unpause care flow', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(unpauseCareFlow)
  const unpauseMock = jest
    .spyOn(AwellSdk.prototype, 'unpauseCareFlow')
    .mockResolvedValue(true)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should unpause a single care flow and call onComplete', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          careFlowIds: 'abc',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(unpauseMock).toHaveBeenCalledTimes(1)
    expect(unpauseMock).toHaveBeenCalledWith({ careflow_id: 'abc' })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should unpause multiple care flows', async () => {
    jest.useFakeTimers()

    const promise = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          careFlowIds: '123, 456',
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

    expect(unpauseMock).toHaveBeenCalledTimes(2)
    expect(unpauseMock).toHaveBeenCalledWith({ careflow_id: '123' })
    expect(unpauseMock).toHaveBeenCalledWith({ careflow_id: '456' })
    expect(onComplete).toHaveBeenCalled()
  })

  test('Should call onError when no care flow ID is provided', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          careFlowIds: '  ',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(unpauseMock).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call onError when the API call fails', async () => {
    unpauseMock.mockRejectedValueOnce(new Error('Unpause care flow failed.'))

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          careFlowIds: 'abc',
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
            message: 'Unpause care flow failed.',
          },
        }),
      ],
    })
  })
})
