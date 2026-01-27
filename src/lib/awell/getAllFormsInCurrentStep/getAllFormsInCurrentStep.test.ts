import { getAllFormsInCurrentStep } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockFormDefinitionOneResponse,
  mockFormDefinitionTwoResponse,
  mockFormResponseOneResponse,
  mockFormResponseTwoResponse,
  mockPathwayActivitiesResponse,
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

describe('getAllFormsInCurrentStep', () => {
  let awellSdkMock: jest.Mocked<AwellSdk>

  beforeEach(() => {
    jest.clearAllMocks()

    awellSdkMock = new AwellSdk({
      apiKey: 'mock-api-key',
    }) as jest.Mocked<AwellSdk>

    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

  })

  test('Should return all forms in the current step sorted by date ascending (chronological)', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock the query results for each call
    // Note: form_activity_1 (older) should be processed first after sorting
    mockQuery
      .mockResolvedValueOnce({
        activity: {
          activity: mockPathwayActivitiesResponse.activities[0],
          success: true,
        },
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: mockPathwayActivitiesResponse,
      })
      // After ascending sort: form_activity_1 (older) comes first, then form_activity_2 (newer)
      .mockResolvedValueOnce({ form: mockFormDefinitionOneResponse })
      .mockResolvedValueOnce({ form: mockFormDefinitionTwoResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseOneResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseTwoResponse })

    const result = await getAllFormsInCurrentStep({
      awellSdk: awellSdkMock,
      pathwayId: 'whatever',
      activityId: 'X74HeDQ4N0gtdaSEuzF8s',
    })

    // on call to get activity
    // one call to GetPathwayActivities
    // two calls to GetFormResponse because the step of interest has 2 form definitions
    // two calls to GetFormResponse each form has a response
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(6)

    // Results should be in ascending order (oldest first = chronological)
    // form_activity_1 has earlier date (22:56:08.315Z) than form_activity_2 (22:56:10.000Z)
    expect(result[0].formActivityId).toBe('form_activity_1')
    expect(result[1].formActivityId).toBe('form_activity_2')
    expect(result).toHaveLength(2)
  })
})
