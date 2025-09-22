import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../../tests/constants'
import { PathwayStatus } from '../../gql/graphql'
import { isPatientEnrolledInCareFlow as actionInterface } from './isPatientEnrolledInCareFlow'
import { FieldsValidationSchema } from './config'
import { ZodError } from 'zod'
import { subDays } from 'date-fns'

jest.mock('@awell-health/awell-sdk')

describe('Is patient already enrolled in care flow action', () => {
  const {
    onComplete,
    onError,
    helpers,
    extensionAction: isPatientEnrolledInCareFlow,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
  })

  describe('Field validation', () => {
    describe('Pathway status', () => {
      test('Single pathway status', () => {
        expect(() => {
          const res = FieldsValidationSchema.safeParse({
            pathwayStatus: 'active',
          })

          if (!res.success) {
            console.log(JSON.stringify(res.error, null, 2))
            throw new Error()
          }

          expect(res.data.pathwayStatus).toEqual([PathwayStatus.Active])
        }).not.toThrow(ZodError)
      })

      test('Multiple pathway statuses', () => {
        expect(() => {
          const res = FieldsValidationSchema.safeParse({
            pathwayStatus: 'active,completed',
          })

          if (!res.success) {
            console.log(JSON.stringify(res.error, null, 2))
            throw new Error()
          }

          expect(res.data.pathwayStatus).toEqual([
            PathwayStatus.Active,
            PathwayStatus.Completed,
          ])
        }).not.toThrow(ZodError)
      })

      test('Multiple pathway statuses with whitespaces', () => {
        expect(() => {
          const res = FieldsValidationSchema.safeParse({
            pathwayStatus: 'active,      completed        , stopped',
          })

          if (!res.success) {
            console.log(JSON.stringify(res.error, null, 2))
            throw new Error()
          }

          expect(res.data.pathwayStatus).toEqual([
            PathwayStatus.Active,
            PathwayStatus.Completed,
            PathwayStatus.Stopped,
          ])
        }).not.toThrow(ZodError)
      })

      test('Invalid pathway statuses get ignored', () => {
        expect(() => {
          const res = FieldsValidationSchema.safeParse({
            pathwayStatus: 'active,completed,invalid',
          })

          if (!res.success) {
            console.log(JSON.stringify(res.error, null, 2))
            throw new Error()
          }

          expect(res.data.pathwayStatus).toEqual([
            PathwayStatus.Active,
            PathwayStatus.Completed,
          ])
        }).not.toThrow(ZodError)
      })
    })
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in the care flow', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: '', // By default, only active care flows
          careFlowDefinitionIds: undefined, // By default, only care flows with same definition id as current care flow
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        nbrOfResults: '1',
        careFlowIds: 'pathway-instance-id-2',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return false if patient is not yet enrolled in another care flow with same care flow definition id', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // Current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: undefined, // By default, only active care flows
          careFlowDefinitionIds: undefined, // By default, only care flows with same definition id as current care flow
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'false',
        nbrOfResults: '0',
        careFlowIds: '',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in a completed care flow when status includes "completed" care flows', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Completed,
                start_date: '2024-06-01T00:00:00.000Z',
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: `${PathwayStatus.Completed}`,
          careFlowDefinitionIds: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        nbrOfResults: '1',
        careFlowIds: 'pathway-instance-id-2',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in another care flow when careFlowDefinitionIds filter is specified', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition two',
                pathway_definition_id: 'pathway-definition-2',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
        },
        fields: {
          pathwayStatus: '',
          careFlowDefinitionIds: 'pathway-definition-2', // Note that this is different than the care flow the patient is currently enrolled in
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        nbrOfResults: '1',
        careFlowIds: 'pathway-instance-id-2',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already in more than one other active or completed care flow', async () => {
    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'pathway-instance-id-3',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Completed,
                start_date: '2024-06-01T00:00:00.000Z',
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: `${PathwayStatus.Active}, ${PathwayStatus.Completed}`,
          careFlowDefinitionIds: 'pathway-definition-1',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        nbrOfResults: '2',
        careFlowIds: 'pathway-instance-id-2,pathway-instance-id-3',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return true if patient is enrolled in care flow within specified day range', async () => {
    const today = new Date()
    const tenDaysAgo = subDays(today, 10)

    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: today.toISOString(),
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: tenDaysAgo.toISOString(),
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: '',
          careFlowDefinitionIds: undefined,
          dayRange: 30, // Check last 30 days
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        nbrOfResults: '1',
        careFlowIds: 'pathway-instance-id-2',
      },
      events: expect.any(Array),
    })
  })

  test('Should return false if patient care flows are outside specified day range', async () => {
    const today = new Date()
    const fortyDaysAgo = subDays(today, 40)

    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: today.toISOString(),
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: fortyDaysAgo.toISOString(),
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: '',
          careFlowDefinitionIds: undefined,
          dayRange: 30, // Check last 30 days
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'false',
        nbrOfResults: '0',
        careFlowIds: '',
      },
      events: expect.any(Array),
    })
  })

  test('Should only return care flows within the specified day range', async () => {
    const today = new Date()
    const fifteenDaysAgo = subDays(today, 15)
    const twentyFiveDaysAgo = subDays(today, 25)
    const fortyFiveDaysAgo = subDays(today, 45)

    const sdkMock = {
      orchestration: {
        query: jest.fn().mockResolvedValue({
          patientPathways: {
            patientPathways: [
              {
                id: 'pathway-instance-id-1', // current care flow
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: today.toISOString(),
              },
              {
                id: 'pathway-instance-id-2',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: fifteenDaysAgo.toISOString(),
              },
              {
                id: 'pathway-instance-id-3',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: twentyFiveDaysAgo.toISOString(),
              },
              {
                id: 'pathway-instance-id-4',
                title: 'Pathway definition one',
                pathway_definition_id: 'pathway-definition-1',
                release_id: 'release-1',
                status: PathwayStatus.Active,
                start_date: fortyFiveDaysAgo.toISOString(),
              },
            ],
          },
        }),
      },
    }

    helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

    await isPatientEnrolledInCareFlow.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-instance-id-1',
          definition_id: 'pathway-definition-1',
          tenant_id: '123',
        },
        fields: {
          pathwayStatus: '',
          careFlowDefinitionIds: undefined,
          dayRange: 30, // Check last 30 days
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        nbrOfResults: '2',
        careFlowIds: 'pathway-instance-id-2,pathway-instance-id-3',
      },
      events: expect.any(Array),
    })
  })
})
