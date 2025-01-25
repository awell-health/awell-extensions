import { AwellSdk } from '@awell-health/awell-sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import { pushFormResponseToHealthie as actionInterface } from '.'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import {
  mockFormDefinitionResponse,
  mockFormResponseResponse,
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

describe('pushFormResponseToHealthie', () => {
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
      query: jest.fn().mockResolvedValue({
        activity: {
          activity: {
            date: new Date().toISOString(),
            context: {
              step_id: 'step-id',
            },
          },
        },
        pathwayStepActivities: mockPathwayActivitiesResponse,
        form: mockFormDefinitionResponse,
        formResponse: mockFormResponseResponse,
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
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(4)

    expect(formResponseToHealthieSpy).toHaveReturnedWith({
      formAnswers: [
        { answer: 'Hellemans', custom_module_id: '14460376' },
        { answer: '1993-11-30', custom_module_id: '14460378' },
        { answer: 'Nick', custom_module_id: '14460375' },
        { answer: '123', custom_module_id: '14460377' },
      ],
      omittedFormAnswers: [],
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        formAnswerGroupId: '99999',
      },
      events: [],
    })
  })

  test('Should call onComplete with frozen set', async () => {
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
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        formAnswerGroupId: '99999',
      },
      events: [],
    })
  })
})
