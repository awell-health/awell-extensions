import { PathwayStatus } from '../../gql/graphql'
import AwellSdk from '../../sdk/awellSdk'
import { isPatientEnrolledInCareFlow } from './isPatientEnrolledInCareFlow'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'getPatientCareFlows')
  .mockImplementation(
    async (input: { patient_id: string; status?: string[] }) => {
      console.log('mocked AwellSdk.searchPatientsByPatientCode', input)

      return [
        {
          title: 'Pathway definition one',
          id: 'pathway-instance-id-1',
          pathway_definition_id: 'pathway-definition-1',
          release_id: 'release-1',
          status: PathwayStatus.Active,
        },
        {
          title: 'Pathway definition one',
          id: 'pathway-instance-id-2',
          pathway_definition_id: 'pathway-definition-1',
          release_id: 'release-1',
          status: PathwayStatus.Completed,
        },
        {
          title: 'Pathway definition two',
          id: 'pathway-instance-id-3',
          pathway_definition_id: 'pathway-definition-2',
          release_id: 'release-1',
          status: PathwayStatus.Active,
        },
        {
          title: 'Pathway definition three',
          id: 'pathway-instance-id-4',
          pathway_definition_id: 'pathway-definition-3',
          release_id: 'release-1',
          status: PathwayStatus.Completed,
        },
      ]
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
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-1',
        },
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: undefined,
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
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return false if patient is not yet enrolled in the care flow', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-999',
        },
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: undefined,
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
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onComplete callback and return true if patient is already enrolled in a completed care flow when status includes "completed" care flows', async () => {
    await isPatientEnrolledInCareFlow.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-3',
        },
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'a-patient-id',
        },
        fields: {
          pathwayStatus: 'completed, stopped',
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
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
