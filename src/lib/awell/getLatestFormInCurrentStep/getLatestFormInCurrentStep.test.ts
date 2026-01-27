import { getLatestFormInCurrentStep } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockFormResponseResponse,
  mockFormDefinitionResponse,
  mockPathwayStepActivitiesResponse,
  mockPathwayStepActivitiesWithMultipleFormsResponse,
  mockCurrentActivityResponse,
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

describe('getLatestFormInCurrentStep', () => {
  let awellSdkMock: jest.Mocked<AwellSdk>

  beforeEach(() => {
    jest.clearAllMocks()

    awellSdkMock = new AwellSdk({
      apiKey: 'mock-api-key',
    }) as jest.Mocked<AwellSdk>
  })

  test('Should return the latest form in the current step', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery
      .mockResolvedValueOnce({
        activity: mockCurrentActivityResponse,
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: mockPathwayStepActivitiesResponse,
      })
      .mockResolvedValueOnce({ form: mockFormDefinitionResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseResponse })

    const result = await getLatestFormInCurrentStep({
      awellSdk: awellSdkMock,
      pathwayId: 'whatever',
      activityId: 'X74HeDQ4N0gtdaSEuzF8s',
    })

    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(4)
    expect(result).toEqual({
      formActivityId: 'RhRQqdbrnSptV3twx7QtV',
      formId: 'OGhjJKF5LRmo',
      formDefinition: mockFormDefinitionResponse.form,
      formResponse: mockFormResponseResponse.response,
    })
  })

  test('Should return the most recent form when multiple forms exist (sorted by date descending)', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery
      .mockResolvedValueOnce({
        activity: mockCurrentActivityResponse,
      })
      .mockResolvedValueOnce({
        // Activities are in ascending order (oldest first) in the mock
        pathwayStepActivities: mockPathwayStepActivitiesWithMultipleFormsResponse,
      })
      .mockResolvedValueOnce({ form: mockFormDefinitionResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseResponse })

    const result = await getLatestFormInCurrentStep({
      awellSdk: awellSdkMock,
      pathwayId: 'whatever',
      activityId: 'X74HeDQ4N0gtdaSEuzF8s',
    })

    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(4)
    // Should return the latest form (1 day ago), NOT the oldest (3 days ago)
    expect(result.formActivityId).toBe('latestFormActivityId')
    expect(result.formId).toBe('latestFormId')
  })
})
