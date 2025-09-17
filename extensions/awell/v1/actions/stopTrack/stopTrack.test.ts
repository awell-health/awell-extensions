import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { stopTrack } from './stopTrack'

jest.mock('../../sdk/awellSdk')

describe('Stop track', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(stopTrack)
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
          trackId: 'track_123',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
})
