import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { addAdhocTrack } from './addAdhocTrack'

jest.mock('../../sdk/awellSdk')

describe('Add ad hoc track', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(addAdhocTrack)
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
          trackId: 'adhoc_track_123',
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
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledWith({
      addTrack: {
        __args: {
          input: {
            track_id: 'adhoc_track_123',
            pathway_id: expect.any(String),
          },
        },
        code: true,
        success: true,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
