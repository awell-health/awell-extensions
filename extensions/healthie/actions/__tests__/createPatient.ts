import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { createPatient } from '../createPatient'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('createPatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a new patient', async () => {
    await createPatient.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          first_name: 'test',
          last_name: 'test',
          legal_name: undefined,
          email: 'test@test.com',
          phone_number: undefined,
          provider_id: undefined,
          skipped_email: undefined,
          dob: undefined,
          dont_send_welcome: undefined,
          testNumber: 1,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.createPatient).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        healthiePatientId: 'patient-1',
      },
    })
  })
})
