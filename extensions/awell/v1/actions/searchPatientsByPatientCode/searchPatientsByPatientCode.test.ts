import { type QuerySearchPatientsByPatientCodeArgs } from '../../gql/graphql'
import AwellSdk from '../../sdk/awellSdk'
import { searchPatientsByPatientCode } from './searchPatientsByPatientCode'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'searchPatientsByPatientCode')
  .mockImplementation(async (input: QuerySearchPatientsByPatientCodeArgs) => {
    console.log('mocked AwellSdk.searchPatientsByPatientCode', input)

    return [
      {
        id: 'patient-id-1',
      },
      {
        id: 'patient-id-2',
      },
    ]
  })

describe('Search patients by patient code', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await searchPatientsByPatientCode.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'test-patient',
          profile: {
            patient_code: '12345',
          },
        },
        fields: {
          pathwayDefinitionId: 'a-pathway-definition-id',
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
        patientAlreadyExists: 'true',
        numberOfPatientsFound: '2',
        awellPatientIds: 'patient-id-1, patient-id-2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
