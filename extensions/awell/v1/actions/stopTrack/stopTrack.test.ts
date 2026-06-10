import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { stopTrack } from './stopTrack'

jest.mock('../../sdk/awellSdk')

describe('Stop track', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(stopTrack)

  const mockCareflowTracks = [
    {
      id: 'track_instance_1',
      status: 'active',
      definition_id: 'track_def_123',
      title: 'Test Track 1',
    },
    {
      id: 'track_instance_2',
      status: 'active',
      definition_id: 'track_def_456',
      title: 'Test Track 2',
    },
  ]

  const sdkMock = {
    orchestration: {
      query: jest.fn().mockResolvedValue({
        careflowTracks: {
          tracks: mockCareflowTracks,
        },
      }),
      mutation: jest.fn().mockResolvedValue({
        stopTrack: {
          code: 'SUCCESS',
          success: true,
        },
      }),
    },
  }

  helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    sdkMock.orchestration.query.mockClear()
    sdkMock.orchestration.mutation.mockClear()
    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)
    sdkMock.orchestration.query.mockResolvedValue({
      careflowTracks: {
        tracks: mockCareflowTracks,
      },
    })
    sdkMock.orchestration.mutation.mockResolvedValue({
      stopTrack: {
        code: 'SUCCESS',
        success: true,
      },
    })
  })

  test('Should stop active tracks and call onComplete with success events', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          trackDefinitionId: 'track_def_123',
        },
        pathway: {
          id: 'pathway_123',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.query).toHaveBeenCalledWith({
      careflowTracks: {
        __args: {
          careflow_id: 'pathway_123',
          statuses: ['active'],
        },
        tracks: {
          id: true,
          status: true,
          definition_id: true,
          title: true,
        },
      },
    })

    // Should call mutation once, only for the active track.
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledWith({
      stopTrack: {
        __args: {
          input: {
            track_id: 'track_instance_1',
            pathway_id: 'pathway_123',
          },
        },
        code: true,
        success: true,
      },
    })
    expect(onComplete).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'Track Test Track 1 with ID track_instance_1 successfully stopped.',
          },
        },
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle case when no active tracks are found', async () => {
    sdkMock.orchestration.query.mockResolvedValue({
      careflowTracks: {
        tracks: [
          {
            id: 'track_instance_1',
            status: 'completed',
            definition_id: 'track_def_123',
            title: 'Completed Track',
          },
        ],
      },
    })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          trackDefinitionId: 'track_def_456',
        },
        pathway: {
          id: 'pathway_123',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(sdkMock.orchestration.query).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).not.toHaveBeenCalled()

    expect(onComplete).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'No active track found with definition ID track_def_456 in care flow pathway_123.',
          },
        },
      ],
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should not stop active tracks for a different definition', async () => {
    sdkMock.orchestration.query.mockResolvedValue({
      careflowTracks: {
        tracks: [
          {
            id: 'track_instance_1',
            status: 'active',
            definition_id: 'track_def_456',
            title: 'Different Track',
          },
        ],
      },
    })

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          trackDefinitionId: 'track_def_123',
        },
        pathway: {
          id: 'pathway_123',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(sdkMock.orchestration.query).toHaveBeenCalledWith({
      careflowTracks: {
        __args: {
          careflow_id: 'pathway_123',
          statuses: ['active'],
        },
        tracks: {
          id: true,
          status: true,
          definition_id: true,
          title: true,
        },
      },
    })
    expect(sdkMock.orchestration.mutation).not.toHaveBeenCalled()

    expect(onComplete).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'No active track found with definition ID track_def_123 in care flow pathway_123.',
          },
        },
      ],
    })
  })
})
