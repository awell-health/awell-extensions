import { AwellSdk } from '@awell-health/awell-sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import { pushFormResponsesToHealthie as actionInterface } from '.'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import {
  mockFormDefinitionOneResponse,
  mockFormDefinitionTwoResponse,
  mockFormResponseOneResponse,
  mockFormResponseTwoResponse,
  mockPathwayActivitiesResponse,
} from './__mocks__'

jest.mock('@awell-health/healthie-sdk', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn().mockResolvedValue({
        createFormAnswerGroup: { form_answer_group: { id: '99999' } },
      }),
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('pushFormResponsesToHealthie', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  const awellSdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({}),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          activity: {
            activity: mockPathwayActivitiesResponse.activities[0],
            success: true,
          },
        })
        .mockResolvedValueOnce({
          pathwayStepActivities: mockPathwayActivitiesResponse,
        })
        .mockResolvedValueOnce({
          form: mockFormDefinitionOneResponse,
        })
        .mockResolvedValueOnce({
          form: mockFormDefinitionTwoResponse,
        })
        .mockResolvedValueOnce({
          formResponse: mockFormResponseOneResponse,
        })
        .mockResolvedValueOnce({
          formResponse: mockFormResponseTwoResponse,
        }),
    },
    /**
     * Utilities don't need to be mocked so we'll just add them back in here
     */
    utils: new AwellSdk({
      environment: 'sandbox',
      apiKey: 'sth',
    }).utils,
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete', async () => {
    const formResponseToHealthieSpy = jest.spyOn(
      awellSdkMock.utils.healthie,
      'awellFormResponseToHealthieFormAnswers',
    )

    await action.onEvent({
      payload: {
        pathway: {
          id: '5eN4qWbxZGSA',
          definition_id: 'whatever',
          tenant_id: '123',
          org_id: '123',
          org_slug: 'org-slug',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        patient: { id: 'whatever' },
        fields: {
          healthiePatientId: '357883',
          healthieFormId: '1686361',
        },
        settings: {
          apiUrl: 'https://staging-api.gethealthie.com/graphql',
          apiKey: 'apiKey',
        },
      },
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)

    /**
     * one call to get activity
     * one call to get pathway step activities
     * two calls to GetFormResponse because the step of interest has 2 form definitions
     * two calls to GetFormResponse each form has a response
     */
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(6)

    expect(formResponseToHealthieSpy).toHaveNthReturnedWith(1, {
      formAnswers: [{ answer: '<p>Nick</p>', custom_module_id: '14460375' }],
      omittedFormAnswers: [],
    })

    expect(formResponseToHealthieSpy).toHaveNthReturnedWith(2, {
      formAnswers: [{ answer: 'Hellemans', custom_module_id: '14460376' }],
      omittedFormAnswers: [],
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        formAnswerGroupId: '99999',
      },
      events: [],
    })
  })
})
