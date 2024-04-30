import { generateTestPayload } from '../../../../../src/tests'
import { type QuerySearchPatientsByPatientCodeArgs } from '../../gql/graphql'
import AwellSdk from '../../sdk/awellSdk'
import { searchPatientsByPatientCode } from './searchPatientsByPatientCode'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'searchPatientsByPatientCode')
  .mockImplementationOnce(
    jest.fn().mockResolvedValue([
      {
        id: 'patient-id-1',
        profile: {
          patient_code: '123',
        },
      },
      {
        id: 'patient-id-2',
        profile: {
          patient_code: '123',
        },
      },
    ])
  )

describe('Search patients by patient code', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await searchPatientsByPatientCode.onActivityCreated(
      generateTestPayload({
        patient: {
          id: 'patient-id-1',
          profile: {
            patient_code: '123',
          },
        },
        fields: {
          pathwayDefinitionId: 'a-pathway-definition-id',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientAlreadyExists: 'true',
        numberOfPatientsFound: '1',
        awellPatientIds: 'patient-id-2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
