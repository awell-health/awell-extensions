import { PathwayStatus } from '../../gql/graphql'
import AwellSdk from '../../sdk/awellSdk'
import { isPatientEnrolledInCareFlow } from './isPatientEnrolledInCareFlow'
import {
  careFlowInstanceOne,
  mockPatienCareFlowsResponse,
  getPathwayTestData,
  careFlowInstanceThree,
  careFlowInstanceTwo,
  careFlowInstanceFive,
} from './__testdata__/patientCareFlows.fixture'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'getPatientCareFlows')
  .mockImplementation(
    async (input: { patient_id: string; status?: string[] }) => {
      console.log('mocked AwellSdk.searchPatientsByPatientCode', input)

      return mockPatienCareFlowsResponse
    }
  )

describe('Is patient already enrolled in care flow action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in the care flow', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: getPathwayTestData(careFlowInstanceOne),
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: '', // By default, only active care flows
          careFlowDefinitionIds: undefined, // By default, only care flows with same definition id as current care flow
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        careFlowIds: careFlowInstanceTwo.id,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return false if patient is not yet enrolled in the care flow', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: {
          id: 'pathway-instance-id-999',
          definition_id: 'pathway-definition-999',
        },
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: undefined, // By default, only active care flows
          careFlowDefinitionIds: undefined, // By default, only care flows with same definition id as current care flow
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'false',
        careFlowIds: '',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in a completed care flow when status includes "completed" care flows', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: getPathwayTestData(careFlowInstanceThree),
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: `${PathwayStatus.Completed}, ${PathwayStatus.Stopped}`,
          careFlowDefinitionIds: undefined,
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'false',
        careFlowIds: '',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in another care flow and when careFlowDefinitionIds filter is specified', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: getPathwayTestData(careFlowInstanceOne),
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: '',
          careFlowDefinitionIds: 'pathway-definition-2', // Note that this is different than the care flow the patient is currently enrolled in
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        careFlowIds: careFlowInstanceThree.id,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already in more than one other active or completed care flow', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: getPathwayTestData(careFlowInstanceOne),
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: `${PathwayStatus.Active}, ${PathwayStatus.Completed}`,
          careFlowDefinitionIds: 'pathway-definition-1',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        result: 'true',
        careFlowIds: `${careFlowInstanceTwo.id},${careFlowInstanceFive.id}`,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
