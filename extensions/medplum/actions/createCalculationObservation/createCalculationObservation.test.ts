import { MedplumClient } from '@medplum/core'
import { createCalculationObservation as action } from './createCalculationObservation'
import { TestHelpers } from '@awell-health/extensions-core'
import { mockSettings } from '../../__mocks__'
import { subDays } from 'date-fns'

jest.mock('@awell-health/awell-sdk')

jest.mock('@medplum/core', () => ({
  MedplumClient: jest.fn().mockImplementation(() => ({
    startClientLogin: jest.fn(),
  })),
}))

describe('Medplum - Create calculation observation', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When a calculation activity is found in the current step', () => {
    const mockCreateResource = jest.fn().mockResolvedValue({
      id: 'some-id',
    })
    const mockedMedplumClient = jest.mocked(MedplumClient)
    mockedMedplumClient.mockImplementation(() => {
      return {
        startClientLogin: jest.fn(),
        createResource: mockCreateResource,
      } as unknown as MedplumClient
    })

    describe('When the calculation result is valid/computed', () => {
      test('Should create a calculation observation with the most recent calculation activity', async () => {
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
                    id: 'calculation',
                    status: 'DONE',
                    date: subDays(new Date(), 1).toISOString(),
                    object: {
                      name: 'BMI',
                      type: 'CALCULATION',
                    },
                    context: {
                      step_id: 'some-step-id',
                    },
                  },
                ],
              },
              calculationResults: {
                result: [
                  {
                    value: '100',
                  },
                  {
                    value: '200',
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

        expect(mockCreateResource).toHaveBeenCalledWith({
          category: [
            {
              coding: [
                {
                  code: 'survey',
                  system:
                    'http://terminology.hl7.org/CodeSystem/observation-category',
                  display: 'Survey',
                },
              ],
              text: 'BMI',
            },
          ],
          code: {
            text: 'BMI',
          },
          derivedFrom: [
            {
              reference: 'QuestionnaireResponse/abc',
            },
          ],
          performer: [
            {
              display: 'Awell',
              identifier: {
                system: 'https://awellhealth.com/activities/',
                value: 'uHiNInqiX-rhfnJEl0mcE',
              },
            },
          ],
          resourceType: 'Observation',
          status: 'final',
          subject: {
            reference: 'Patient/5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
          },
          valueQuantity: {
            value: 100,
          },
        })
        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            observationId: 'some-id',
          },
        })
      })
    })

    describe('When the calculation result is invalid or undefined', () => {
      test('Should create a calculation observation with absent reason', async () => {
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
                    id: 'calculation',
                    status: 'DONE',
                    date: subDays(new Date(), 1).toISOString(),
                    object: {
                      name: 'BMI',
                      type: 'CALCULATION',
                    },
                    context: {
                      step_id: 'some-step-id',
                    },
                  },
                ],
              },
              calculationResults: {
                result: [
                  {
                    value: undefined,
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

        expect(mockCreateResource).toHaveBeenCalledWith({
          category: [
            {
              coding: [
                {
                  code: 'survey',
                  system:
                    'http://terminology.hl7.org/CodeSystem/observation-category',
                  display: 'Survey',
                },
              ],
              text: 'BMI',
            },
          ],
          code: {
            text: 'BMI',
          },
          derivedFrom: [
            {
              reference: 'QuestionnaireResponse/abc',
            },
          ],
          performer: [
            {
              display: 'Awell',
              identifier: {
                system: 'https://awellhealth.com/activities/',
                value: 'uHiNInqiX-rhfnJEl0mcE',
              },
            },
          ],
          resourceType: 'Observation',
          status: 'final',
          subject: {
            reference: 'Patient/5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
          },
          dataAbsentReason: {
            coding: [
              {
                code: 'not-performed',
                display: 'Not Performed',
                system: 'http://hl7.org/fhir/data-absent-reason',
              },
            ],
          },
        })
        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            observationId: 'some-id',
          },
        })
      })
    })
  })

  describe('When no (completed) calculation activity is found in the current step', () => {
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
              // No completed calculation activities in this array
              activities: [
                {
                  id: 'calculation',
                  status: 'ACTIVE',
                  date: '2025-01-15T00:00:00.000Z',
                  object: {
                    type: 'CALCULATION',
                  },
                  context: {
                    step_id: 'some-step-id',
                  },
                },
                {
                  id: 'form',
                  status: 'DONE',
                  date: '2025-01-15T00:00:00.000Z',
                  object: {
                    type: 'FORM',
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
              en: 'No calculation activity found in the current step',
            },
          },
        ],
      })
    })
  })
})
