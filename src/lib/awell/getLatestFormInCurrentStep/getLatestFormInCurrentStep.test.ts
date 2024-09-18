import { getLatestFormInCurrentStep } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockFormResponseResponse,
  mockFormDefinitionResponse,
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
        pathwayActivities: mockPathwayActivitiesResponse,
      })
      .mockResolvedValueOnce({ form: mockFormDefinitionResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseResponse })
  })

  test('Should return the latest form in the current step', async () => {
    const result = await getLatestFormInCurrentStep({
      awellSdk: awellSdkMock,
      pathwayId: 'whatever',
      activityId: 'X74HeDQ4N0gtdaSEuzF8s',
    })

    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3)

    expect(result).toEqual({
      formActivityId: 'RhRQqdbrnSptV3twx7QtV',
      formId: 'OGhjJKF5LRmo',
      formDefinition: mockFormDefinitionResponse.form,
      formResponse: mockFormResponseResponse.response,
    })
  })
})
