import { getFormsInTrack } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockFormDefinitionOneResponse,
  mockFormDefinitionTwoResponse,
  mockFormResponseOneResponse,
  mockFormResponseTwoResponse,
  mockTrackActivitiesResponse,
} from './__testdata__'

jest.mock('@awell-health/awell-sdk', () => {
  return {
    AwellSdk: jest.fn().mockImplementation(() => ({
      orchestration: {
        query: jest.fn(),
      },
    })),
  }
})

describe('getFormsInTrack', () => {
  let awellSdkMock: jest.Mocked<AwellSdk>

  beforeEach(() => {
    jest.clearAllMocks()

    awellSdkMock = new AwellSdk({
      apiKey: 'mock-api-key',
    }) as jest.Mocked<AwellSdk>
  })

  test('Should return all completed forms in the track sorted by date ascending', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    mockQuery
      // First query: get current activity (to find track_id)
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              track_id: 'track-1',
            },
          },
        },
      })
      // Second query: get all activities in the track
      .mockResolvedValueOnce({
        pathwayActivities: mockTrackActivitiesResponse,
      })
      // Form definitions fire first (Promise.all interleaving)
      .mockResolvedValueOnce({ form: mockFormDefinitionOneResponse })
      .mockResolvedValueOnce({ form: mockFormDefinitionTwoResponse })
      // Then form responses
      .mockResolvedValueOnce({ formResponse: mockFormResponseOneResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseTwoResponse })

    const result = await getFormsInTrack({
      awellSdk: awellSdkMock,
      pathwayId: 'pathway-1',
      activityId: 'X74HeDQ4N0gtdaSEuzF8s',
    })

    // 1 activity + 1 pathwayActivities + 2 formDef + 2 formResp = 6
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(6)

    // Should return 2 forms (ACTIVE and future forms filtered out)
    expect(result).toHaveLength(2)

    // Results should be in ascending order (oldest first)
    expect(result[0].formActivityId).toBe('form_activity_1')
    expect(result[0].formName).toBe('Screening Form')
    expect(result[1].formActivityId).toBe('form_activity_2')
    expect(result[1].formName).toBe('Intake Form')
  })

  test('Should return empty array when no completed forms exist in the track', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    mockQuery
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              track_id: 'track-1',
            },
          },
        },
      })
      .mockResolvedValueOnce({
        pathwayActivities: {
          success: true,
          activities: [],
        },
      })

    const result = await getFormsInTrack({
      awellSdk: awellSdkMock,
      pathwayId: 'pathway-1',
      activityId: 'X74HeDQ4N0gtdaSEuzF8s',
    })

    expect(result).toHaveLength(0)
    // Should only make 2 queries (activity + pathwayActivities), no form fetches
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(2)
  })

  test('Should throw when the current activity cannot be found', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    mockQuery.mockResolvedValueOnce({
      activity: {
        success: true,
        activity: null,
      },
    })

    await expect(
      getFormsInTrack({
        awellSdk: awellSdkMock,
        pathwayId: 'pathway-1',
        activityId: 'missing-activity',
      }),
    ).rejects.toThrow('Cannot find the current activity')
  })

  test('Should throw when the activity has no track_id', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    mockQuery.mockResolvedValueOnce({
      activity: {
        success: true,
        activity: {
          id: 'X74HeDQ4N0gtdaSEuzF8s',
          date: '2024-09-11T22:56:59.607Z',
          context: {
            track_id: '',
          },
        },
      },
    })

    await expect(
      getFormsInTrack({
        awellSdk: awellSdkMock,
        pathwayId: 'pathway-1',
        activityId: 'X74HeDQ4N0gtdaSEuzF8s',
      }),
    ).rejects.toThrow('Could not find track ID for the current activity')
  })
})
