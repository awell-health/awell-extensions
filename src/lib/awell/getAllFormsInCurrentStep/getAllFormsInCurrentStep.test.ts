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

    // Mock the query results for each call
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
      .mockResolvedValueOnce({ form: mockFormDefinitionOneResponse })
      .mockResolvedValueOnce({ form: mockFormDefinitionTwoResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseOneResponse })
      .mockResolvedValueOnce({ formResponse: mockFormResponseTwoResponse })
  })

  test('Should return all forms in the current step', async () => {
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

    expect(result).toEqual([
      {
        formActivityId: 'form_activity_2',
        formId: 'form_2',
        formDefinition: {
          questions: [
            {
              id: 'short_text',
              definition_id: 'qiIFXlNLUVzN',
              title: 'Question that collects a string value',
              key: 'questionThatCollectsAStringValue',
              dataPointValueType: 'STRING',
              questionType: 'INPUT',
              userQuestionType: 'SHORT_TEXT',
              metadata: '{"healthieCustomModuleId":"short_text"}',
              options: [],
              __typename: 'Question',
              questionConfig: null,
              rule: null,
            },
          ],
        },
        formResponse: {
          answers: [
            {
              question_id: 'short_text',
              value: 'A short answer',
              value_type: 'STRING',
              label: null,
              __typename: 'Answer',
            },
          ],
        },
      },
      {
        formActivityId: 'form_activity_1',
        formId: 'form_1',
        formDefinition: {
          questions: [
            {
              id: 'long_text',
              definition_id: 'tSFHKGROz6Zm',
              title: 'Question that collects a string but long-form (textarea)',
              key: 'questionThatCollectsAStringButLongFormTextarea',
              dataPointValueType: 'STRING',
              questionType: 'INPUT',
              userQuestionType: 'LONG_TEXT',
              metadata: '{"healthieCustomModuleId":"long_text"}',
              options: [],
              __typename: 'Question',
              questionConfig: null,
              rule: null,
            },
          ],
        },
        formResponse: {
          answers: [
            {
              question_id: 'long_text',
              value: 'A long text',
              value_type: 'STRING',
              label: null,
              __typename: 'Answer',
            },
          ],
        },
      },
    ])
  })
})
