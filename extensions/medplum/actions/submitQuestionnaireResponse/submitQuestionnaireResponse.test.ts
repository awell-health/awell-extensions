import { MedplumClient } from '@medplum/core'
import { submitQuestionnaireResponse as action } from './submitQuestionnaireResponse'
import { TestHelpers } from '@awell-health/extensions-core'
import { mockSettings } from '../../__mocks__'
import { subDays } from 'date-fns'
import {
  simpleFormMockResponse,
  simpleFormResponseMockResponse,
} from './__testdata__'
import { AwellSdk } from '@awell-health/awell-sdk'

jest.mock('@medplum/core', () => ({
  MedplumClient: jest.fn().mockImplementation(() => ({
    startClientLogin: jest.fn(),
  })),
}))

describe('Medplum - Create questionnaire response', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When a form activity is found in the current step', () => {
    const mockCreateResource = jest.fn().mockResolvedValue({
      id: 'QuestionnaireResponseResourceId',
    })
    const mockedMedplumClient = jest.mocked(MedplumClient)
    mockedMedplumClient.mockImplementation(() => {
      return {
        startClientLogin: jest.fn(),
        createResourceIfNoneExist: jest.fn().mockResolvedValue({
          id: 'QuestionnaireResourceId',
        }),
        createResource: mockCreateResource,
      } as unknown as MedplumClient
    })

    test('It should create the observation resource', async () => {
      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockResolvedValue({
            activity: {
              activity: {
                date: new Date().toISOString(),
                context: {
                  step_id: 'some-step-id',
                },
              },
            },
            pathwayStepActivities: {
              activities: [
                {
                  id: 'form',
                  status: 'DONE',
                  date: subDays(new Date(), 1).toISOString(),
                  object: {
                    name: 'Simple form',
                    type: 'FORM',
                  },
                  context: {
                    step_id: 'some-step-id',
                  },
                },
              ],
            },
            form: simpleFormMockResponse,
            formResponse: simpleFormResponseMockResponse,
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

      await extensionAction.onEvent({
        payload: {
          fields: {
            patientId: '5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
            questionnaireResponseId: 'abc',
          },
          pathway: {
            id: '3P9PnTa50RD8',
          },
          activity: {
            id: 'uHiNInqiX-rhfnJEl0mcE',
          },
          settings: mockSettings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(mockCreateResource).toHaveBeenCalledWith({
        item: [
          {
            answer: [
              {
                valueCoding: {
                  code: '1',
                  display: 'Option 2',
                },
              },
            ],
            linkId: 'question-id',
            text: 'Single select (number)',
          },
        ],
        questionnaire: 'Questionnaire/QuestionnaireResourceId',
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        subject: {
          reference: 'Patient/5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
        },
      })
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          questionnnaireResponseId: 'QuestionnaireResponseResourceId',
        },
      })
    })
  })

  describe('When no (completed) form activity is found in the current step', () => {
    test('Should call onError', async () => {
      const awellSdkMock = {
        orchestration: {
          query: jest.fn().mockResolvedValue({
            activity: {
              activity: {
                context: {
                  step_id: 'some-step-id',
                },
              },
            },
            pathwayStepActivities: {
              // No completed form activities in this array
              activities: [
                {
                  id: 'form',
                  status: 'ACTIVE',
                  date: '2025-01-15T00:00:00.000Z',
                  object: {
                    type: 'FORM',
                  },
                  context: {
                    step_id: 'some-step-id',
                  },
                },
                {
                  id: 'calculation',
                  status: 'DONE',
                  date: '2025-01-15T00:00:00.000Z',
                  object: {
                    type: 'CALCULATION',
                  },
                  context: {
                    step_id: 'some-step-id',
                  },
                },
              ],
            },
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      await extensionAction.onEvent({
        payload: {
          fields: {
            patientId: '5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
            questionnaireResponseId: 'abc',
          },
          pathway: {
            id: '3P9PnTa50RD8',
          },
          activity: {
            id: 'uHiNInqiX-rhfnJEl0mcE',
          },
          settings: mockSettings,
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: {
              en: 'No (completed) form action found in the current step',
            },
          },
        ],
      })
    })
  })
})
