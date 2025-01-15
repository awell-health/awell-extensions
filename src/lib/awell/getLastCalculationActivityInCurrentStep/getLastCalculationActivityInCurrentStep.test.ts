import { getLastCalculationActivityInCurrentStep } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockCurrentActivityResponse,
  mockPathwayStepActivitiesResponse,
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

    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock the query results for each call
    mockQuery
      .mockResolvedValueOnce({
        activity: mockCurrentActivityResponse,
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: mockPathwayStepActivitiesResponse,
      })
  })

  test('Should return the expected calculation results form in the current step', async () => {
    const result = await getLastCalculationActivityInCurrentStep({
      awellSdk: awellSdkMock,
      pathwayId: 'some-pathway-id',
      currentActivityId: 'some-activity-id',
    })

    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      id: 'calculation_two',
      status: 'DONE',
      date: expect.any(String),
      object: {
        id: 'calculation_two',
        type: 'CALCULATION',
      },
      context: {
        step_id: 'step_a',
      },
    })
  })
})
