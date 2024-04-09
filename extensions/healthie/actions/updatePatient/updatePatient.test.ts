import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { updatePatient } from '../updatePatient/updatePatient'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('updatePatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should update patient', async () => {
    await updatePatient.onActivityCreated(
      generateTestPayload({
        fields: {
          id: 'patient-1',
          first_name: 'test',
          last_name: 'test',
          legal_name: undefined,
          email: undefined,
          phone_number: undefined,
          provider_id: undefined,
          gender: undefined,
          gender_identity: undefined,
          height: undefined,
          sex: undefined,
          user_group_id: undefined,
          active: true,
          dob: '1990-01-01',
          skipped_email: false,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updatePatient).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
